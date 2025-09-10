import React, { useState, useEffect } from "react";
import { api } from "../../lib/supabaseClient";

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export function PublicKB() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/kb/public");
      if (response.success) {
        setArticles(response.articles);
      } else {
        setError("Failed to fetch articles");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading knowledge base...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={fetchArticles}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600 mt-2">
          Browse our public documentation and guides
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No articles found.</div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {article.title}
              </h2>
              <div className="text-gray-600 text-sm mb-4">
                Last updated:{" "}
                {new Date(article.updated_at).toLocaleDateString()}
              </div>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(article.content),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple markdown formatter for MVP
function formatMarkdown(content: string): string {
  return content
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/^(\d+)\. (.*$)/gim, "<li>$1. $2</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|l])/gm, "<p>")
    .replace(/(?<!>)$/gm, "</p>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p>(<[h|l])/g, "$1")
    .replace(/(<\/[h|l][^>]*>)<\/p>/g, "$1");
}
