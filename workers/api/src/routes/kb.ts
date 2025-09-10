import { Hono } from "hono";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const kbRoutes = new Hono();

// GET /kb/public - Get public knowledge base articles
kbRoutes.get("/public", async (c) => {
  try {
    // For MVP, we'll serve static files from apps/web/public/kb/
    // In a real implementation, this would read from the filesystem or a CDN

    const publicArticles = [
      {
        id: "getting-started",
        title: "Getting Started",
        content:
          "# Getting Started\n\nWelcome to QiEOS. This is your guide to getting started with our platform.\n\n## Features\n\n- Task Management\n- File Storage\n- Knowledge Base\n- Client Portal\n\n## Next Steps\n\n1. Complete your profile\n2. Explore the dashboard\n3. Create your first task",
        slug: "getting-started",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return c.json({
      success: true,
      articles: publicArticles,
    });
  } catch (error) {
    console.error("Public KB error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /kb/private - Get private knowledge base articles
kbRoutes.get("/private", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    // Build query based on role and company access
    let query = supabaseAdmin
      .from("kb_docs")
      .select(
        `
        id,
        title,
        content,
        slug,
        created_at,
        updated_at,
        collection_id,
        company_id,
        kb_collections (
          id,
          name,
          path
        )
      `
      )
      .eq("org_id", claims.org_id);

    // If external user, only show docs for their companies
    if (claims.role === "external") {
      query = query.in("company_id", claims.company_ids || []);
    }

    const { data: articles, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching private KB articles:", error);
      return c.json({ error: "Failed to fetch articles" }, 500);
    }

    return c.json({
      success: true,
      articles: articles || [],
    });
  } catch (error) {
    console.error("Private KB error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /kb/collections - Get knowledge base collections
kbRoutes.get("/collections", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    // Build query based on role and company access
    let query = supabaseAdmin
      .from("kb_collections")
      .select(
        `
        id,
        name,
        description,
        path,
        parent_id,
        company_id,
        created_at,
        updated_at
      `
      )
      .eq("org_id", claims.org_id);

    // If external user, only show collections for their companies
    if (claims.role === "external") {
      query = query.in("company_id", claims.company_ids || []);
    }

    const { data: collections, error } = await query.order("path", {
      ascending: true,
    });

    if (error) {
      console.error("Error fetching KB collections:", error);
      return c.json({ error: "Failed to fetch collections" }, 500);
    }

    return c.json({
      success: true,
      collections: collections || [],
    });
  } catch (error) {
    console.error("KB collections error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /kb/article/:id - Get specific article
kbRoutes.get("/article/:id", async (c) => {
  try {
    const claims = c.get("claims");
    const articleId = c.req.param("id");

    // First try to get from private KB
    if (claims) {
      let query = supabaseAdmin
        .from("kb_docs")
        .select(
          `
          id,
          title,
          content,
          slug,
          created_at,
          updated_at,
          collection_id,
          company_id,
          kb_collections (
            id,
            name,
            path
          )
        `
        )
        .eq("id", articleId)
        .eq("org_id", claims.org_id);

      // If external user, check company access
      if (claims.role === "external") {
        query = query.in("company_id", claims.company_ids || []);
      }

      const { data: article, error } = await query.single();

      if (!error && article) {
        return c.json({
          success: true,
          article,
        });
      }
    }

    // If not found in private KB, try public KB
    if (articleId === "getting-started") {
      const publicArticle = {
        id: "getting-started",
        title: "Getting Started",
        content:
          "# Getting Started\n\nWelcome to QiEOS. This is your guide to getting started with our platform.\n\n## Features\n\n- Task Management\n- File Storage\n- Knowledge Base\n- Client Portal\n\n## Next Steps\n\n1. Complete your profile\n2. Explore the dashboard\n3. Create your first task",
        slug: "getting-started",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return c.json({
        success: true,
        article: publicArticle,
      });
    }

    return c.json({ error: "Article not found" }, 404);
  } catch (error) {
    console.error("KB article error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { kbRoutes };
