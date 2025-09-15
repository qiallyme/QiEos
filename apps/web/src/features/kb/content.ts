import matter from "gray-matter";

export interface DocMeta {
  title: string;
  description?: string;
  tags?: string[];
  updated?: string;
  audiences?: string[];
  [key: string]: any;
}

export interface Doc {
  frontMatter: DocMeta;
  body: string;
  ext: string;
  path: string;
}

export interface SearchIndexItem {
  path: string;
  title: string;
  description?: string;
  tags?: string[];
  audiences?: string[];
  content: string;
  updated?: string;
}

export interface SearchIndex {
  items: SearchIndexItem[];
  lastUpdated: string;
}

/**
 * Fetches and parses navigation structure from nav.yaml
 */
export async function getDocList(): Promise<
  Array<{
    path: string;
    title: string;
    children?: Array<{ path: string; title: string }>;
  }>
> {
  try {
    const response = await fetch("/kb/_meta/nav.yaml");
    if (!response.ok) {
      console.warn("Could not fetch nav.yaml, using fallback structure");
      return [
        { path: "/kb/articles/welcome", title: "Welcome" },
        {
          path: "/kb/policies/tax-engagement-letter",
          title: "Tax Engagement Letter",
        },
      ];
    }

    const yamlText = await response.text();
    // Simple YAML parsing for basic structure
    // In production, you might want to use a proper YAML parser
    const lines = yamlText.split("\n");
    const result: any[] = [];
    let currentSection: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- title:")) {
        const title = trimmed
          .replace("- title:", "")
          .trim()
          .replace(/['"]/g, "");
        currentSection = { title, children: [] };
        result.push(currentSection);
      } else if (trimmed.startsWith("  - title:") && currentSection) {
        const title = trimmed
          .replace("  - title:", "")
          .trim()
          .replace(/['"]/g, "");
        const path = `/kb/${title.toLowerCase().replace(/\s+/g, "-")}`;
        currentSection.children.push({ path, title });
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching doc list:", error);
    return [
      { path: "/kb/articles/welcome", title: "Welcome" },
      {
        path: "/kb/policies/tax-engagement-letter",
        title: "Tax Engagement Letter",
      },
    ];
  }
}

/**
 * Fetches a document by path and parses front matter
 */
export async function getDoc(path: string): Promise<Doc | null> {
  try {
    // Normalize path - remove leading slash and ensure .md extension
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    const docPath = normalizedPath.endsWith(".md")
      ? normalizedPath
      : `${normalizedPath}.md`;

    const response = await fetch(`/${docPath}`);
    if (!response.ok) {
      console.warn(`Document not found: ${docPath}`);
      return null;
    }

    const content = await response.text();
    const { data: frontMatter, content: body } = matter(content);

    return {
      frontMatter: frontMatter as DocMeta,
      body,
      ext: "md",
      path: normalizedPath,
    };
  } catch (error) {
    console.error(`Error fetching document ${path}:`, error);
    return null;
  }
}

/**
 * Fetches the search index
 */
export async function getSearchIndex(): Promise<SearchIndex | null> {
  try {
    const response = await fetch("/kb/_meta/search-index.json");
    if (!response.ok) {
      console.warn("Search index not found, creating empty index");
      return {
        items: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching search index:", error);
    return {
      items: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Search documents using the search index
 */
export async function searchDocs(query: string): Promise<SearchIndexItem[]> {
  const index = await getSearchIndex();
  if (!index || !query.trim()) {
    return index?.items || [];
  }

  const searchTerms = query.toLowerCase().split(/\s+/);

  return index.items.filter((item) => {
    const searchableText = [
      item.title,
      item.description || "",
      item.content,
      ...(item.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });
}

/**
 * Get document by slug (for direct access)
 */
export async function getDocBySlug(slug: string): Promise<Doc | null> {
  // Try different possible paths
  const possiblePaths = [
    `/kb/articles/${slug}`,
    `/kb/policies/${slug}`,
    `/kb/playbooks/${slug}`,
    `/kb/templates/${slug}`,
    `/kb/releases/${slug}`,
  ];

  for (const path of possiblePaths) {
    const doc = await getDoc(path);
    if (doc) {
      return doc;
    }
  }

  return null;
}
