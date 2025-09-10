import { Hono } from "hono";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const taskRoutes = new Hono();

// Task schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().datetime().optional(),
});

// GET /tasks - List tasks scoped by org/company
taskRoutes.get("/", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const { company_id } = c.req.query();

    // Build query based on role and company access
    let query = supabaseAdmin
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at,
        project_id,
        company_id,
        projects (
          id,
          name
        )
      `
      )
      .eq("org_id", claims.org_id);

    // If company_id is specified, check access
    if (company_id) {
      if (!claims.company_ids?.includes(company_id)) {
        return c.json({ error: "Access denied to company" }, 403);
      }
      query = query.eq("company_id", company_id);
    } else if (claims.role === "external") {
      // External users can only see tasks for their companies
      query = query.in("company_id", claims.company_ids || []);
    }

    const { data: tasks, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching tasks:", error);
      return c.json({ error: "Failed to fetch tasks" }, 500);
    }

    return c.json({ success: true, tasks });
  } catch (error) {
    console.error("Tasks GET error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /tasks - Create new task
taskRoutes.post("/", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const body = await c.req.json();
    const validated = createTaskSchema.parse(body);

    // Check company access if specified
    if (
      validated.company_id &&
      !claims.company_ids?.includes(validated.company_id)
    ) {
      return c.json({ error: "Access denied to company" }, 403);
    }

    // Check project access if specified
    if (validated.project_id) {
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("id, company_id")
        .eq("id", validated.project_id)
        .eq("org_id", claims.org_id)
        .single();

      if (!project) {
        return c.json({ error: "Project not found" }, 404);
      }

      if (
        project.company_id &&
        !claims.company_ids?.includes(project.company_id)
      ) {
        return c.json({ error: "Access denied to project company" }, 403);
      }
    }

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        ...validated,
        org_id: claims.org_id,
        company_id: validated.company_id || null,
        project_id: validated.project_id || null,
        status: "todo",
        created_by: claims.user_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return c.json({ error: "Failed to create task" }, 500);
    }

    return c.json({ success: true, task }, 201);
  } catch (error) {
    console.error("Tasks POST error:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request format", details: error.errors },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// PATCH /tasks/:id - Update task
taskRoutes.patch("/:id", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const taskId = c.req.param("id");
    const body = await c.req.json();
    const validated = updateTaskSchema.parse(body);

    // First, check if task exists and user has access
    const { data: existingTask } = await supabaseAdmin
      .from("tasks")
      .select("id, company_id, org_id")
      .eq("id", taskId)
      .eq("org_id", claims.org_id)
      .single();

    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Check company access
    if (
      existingTask.company_id &&
      !claims.company_ids?.includes(existingTask.company_id)
    ) {
      return c.json({ error: "Access denied to task company" }, 403);
    }

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return c.json({ error: "Failed to update task" }, 500);
    }

    return c.json({ success: true, task });
  } catch (error) {
    console.error("Tasks PATCH error:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request format", details: error.errors },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /tasks/:id - Delete task
taskRoutes.delete("/:id", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const taskId = c.req.param("id");

    // Check if task exists and user has access
    const { data: existingTask } = await supabaseAdmin
      .from("tasks")
      .select("id, company_id, org_id")
      .eq("id", taskId)
      .eq("org_id", claims.org_id)
      .single();

    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }

    // Check company access
    if (
      existingTask.company_id &&
      !claims.company_ids?.includes(existingTask.company_id)
    ) {
      return c.json({ error: "Access denied to task company" }, 403);
    }

    const { error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return c.json({ error: "Failed to delete task" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Tasks DELETE error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { taskRoutes };
