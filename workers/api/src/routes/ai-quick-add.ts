import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
  JWT_ISSUER: string;
  JWT_SECRET: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get auth token from header
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid authorization" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const token = authHeader.substring(7);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user's org_id from contacts table
      const { data: contact } = await supabase
        .from("contacts")
        .select("org_id")
        .eq("supabase_user_id", user.id)
        .single();

      if (!contact) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orgId = contact.org_id;

      // Routes
      switch (true) {
        // POST /ai/quick-add - AI-powered quick add
        case path === "/ai/quick-add" && method === "POST":
          return await aiQuickAdd(supabase, orgId, user.id, request, env);

        // POST /ai/suggest - AI task suggestions
        case path === "/ai/suggest" && method === "POST":
          return await aiSuggest(supabase, orgId, user.id, request, env);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("AI Quick Add API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// AI-powered quick add with natural language processing
async function aiQuickAdd(
  supabase: any,
  orgId: string,
  userId: string,
  request: Request,
  env: Env
) {
  const body = (await request.json()) as any;
  const { text, context } = body;

  if (!text) {
    return new Response(JSON.stringify({ error: "Text is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get user's projects for context
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, type")
      .eq("org_id", orgId);

    // Get recent tasks for context
    const { data: recentTasks } = await supabase
      .from("tasks")
      .select("title, labels, project_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Build context for AI
    const aiContext = {
      user_projects: projects || [],
      recent_tasks: recentTasks || [],
      user_context: context || {},
    };

    // Call OpenAI API for intelligent parsing
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a task management AI assistant. Parse natural language task input and extract structured data.

Available projects: ${JSON.stringify(aiContext.user_projects)}
Recent tasks: ${JSON.stringify(aiContext.recent_tasks)}

Return a JSON object with:
- title: Clean task title
- description: Optional description
- priority: 1-4 (1=urgent, 4=low)
- due_date: ISO date string or null
- labels: Array of label strings
- project_id: Matching project ID or null
- estimated_duration: Minutes or null

Examples:
"Buy groceries tomorrow" -> {"title": "Buy groceries", "priority": 3, "due_date": "2025-01-28T00:00:00Z", "labels": [], "project_id": null, "estimated_duration": 30}
"Urgent: Fix bug in login system p1" -> {"title": "Fix bug in login system", "priority": 1, "due_date": null, "labels": ["bug", "login"], "project_id": null, "estimated_duration": 120}
"Review quarterly report #work #important" -> {"title": "Review quarterly report", "priority": 2, "due_date": null, "labels": ["work", "important"], "project_id": null, "estimated_duration": 60}`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiParsed = JSON.parse(openaiData.choices[0].message.content);

    // Create the task
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        org_id: orgId,
        title: aiParsed.title,
        description: aiParsed.description || "",
        priority: aiParsed.priority || 3,
        due_date: aiParsed.due_date || null,
        labels: aiParsed.labels || [],
        project_id: aiParsed.project_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("task_activity").insert({
      org_id: orgId,
      task_id: task.id,
      user_id: userId,
      action: "created",
      details: {
        title: aiParsed.title,
        project_id: aiParsed.project_id,
        ai_parsed: true,
        original_text: text,
      },
    });

    return new Response(
      JSON.stringify({
        task,
        ai_parsed: aiParsed,
        original_text: text,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("AI Quick Add error:", error);

    // Fallback to simple parsing if AI fails
    const fallbackParsed = parseQuickAddText(text);

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        org_id: orgId,
        title: fallbackParsed.title,
        description: fallbackParsed.description || "",
        priority: fallbackParsed.priority || 3,
        due_date: fallbackParsed.due_date || null,
        labels: fallbackParsed.labels || [],
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        task,
        ai_parsed: fallbackParsed,
        original_text: text,
        fallback: true,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// AI task suggestions based on context
async function aiSuggest(
  supabase: any,
  orgId: string,
  userId: string,
  request: Request,
  env: Env
) {
  const body = (await request.json()) as any;
  const { context, limit = 5 } = body;

  try {
    // Get user's recent activity and projects
    const { data: recentActivity } = await supabase
      .from("task_activity")
      .select("action, details")
      .eq("org_id", orgId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, type")
      .eq("org_id", orgId);

    const { data: incompleteTasks } = await supabase
      .from("tasks")
      .select("title, labels, due_date")
      .eq("org_id", orgId)
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    // Call OpenAI for suggestions
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a productivity AI assistant. Based on user activity and context, suggest relevant tasks.

Recent activity: ${JSON.stringify(recentActivity)}
Projects: ${JSON.stringify(projects)}
Incomplete tasks: ${JSON.stringify(incompleteTasks)}
User context: ${JSON.stringify(context)}

Return a JSON array of suggested tasks, each with:
- title: Suggested task title
- description: Brief description
- priority: 1-4
- labels: Array of relevant labels
- reasoning: Why this task is suggested

Focus on:
1. Follow-up tasks from recent activity
2. Breaking down incomplete tasks
3. Related tasks based on patterns
4. Time-sensitive suggestions

Return max ${limit} suggestions.`,
            },
            {
              role: "user",
              content: "Suggest tasks based on my activity and context",
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const suggestions = JSON.parse(openaiData.choices[0].message.content);

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Suggest error:", error);

    // Fallback suggestions
    const fallbackSuggestions = [
      {
        title: "Review and organize tasks",
        description:
          "Take time to review your current tasks and organize them by priority",
        priority: 3,
        labels: ["organization", "review"],
        reasoning: "Regular task review helps maintain productivity",
      },
      {
        title: "Plan upcoming week",
        description: "Set goals and plan tasks for the upcoming week",
        priority: 2,
        labels: ["planning", "weekly"],
        reasoning: "Weekly planning helps maintain focus and direction",
      },
    ];

    return new Response(
      JSON.stringify({
        suggestions: fallbackSuggestions.slice(0, limit),
        fallback: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Fallback simple parser (same as before)
function parseQuickAddText(text: string) {
  const result: any = {
    title: text,
    description: "",
    priority: 3,
    due_date: null,
    labels: [],
  };

  // Extract priority (p1, p2, p3, p4)
  const priorityMatch = text.match(/\bp([1-4])\b/i);
  if (priorityMatch) {
    result.priority = parseInt(priorityMatch[1]);
    result.title = result.title.replace(priorityMatch[0], "").trim();
  }

  // Extract due date (today, tomorrow, next week, specific date)
  const today = new Date();
  if (text.includes("today")) {
    result.due_date = today.toISOString();
    result.title = result.title.replace(/\btoday\b/i, "").trim();
  } else if (text.includes("tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.due_date = tomorrow.toISOString();
    result.title = result.title.replace(/\btomorrow\b/i, "").trim();
  }

  // Extract labels (#label)
  const labelMatches = text.match(/#(\w+)/g);
  if (labelMatches) {
    result.labels = labelMatches.map((label) => label.substring(1));
    result.title = result.title.replace(/#\w+/g, "").trim();
  }

  return result;
}

