import React, { useState, useEffect } from "react";
import { api } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  collection_id?: string;
  company_id?: string;
  kb_collections?: {
    id: string;
    name: string;
    path: string;
  };
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  path: string;
  parent_id?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export function PrivateKB() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { claims } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [articlesResponse, collectionsResponse] = await Promise.all([
        api.get("/kb/private"),
        api.get("/kb/collections"),
      ]);

      if (articlesResponse.success) {
        setArticles(articlesResponse.articles);
      }
      if (collectionsResponse.success) {
        setCollections(collectionsResponse.collections);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const openArticle = async (articleId: string) => {
    try {
      const response = await api.get(`/kb/article/${articleId}`);
      if (response.success) {
        setSelectedArticle(response.article);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load article");
    }
  };

  const formatMarkdown = (content: string): string => {
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
          onClick={fetchData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Private Knowledge Base
        </h1>
        <p className="text-gray-600 mt-2">
          Access your organization's private documentation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Collections
            </h2>
            {collections.length > 0 ? (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div key={collection.id} className="text-sm text-gray-600">
                    {collection.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No collections found</p>
            )}

            <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
              Articles
            </h2>
            {articles.length > 0 ? (
              <div className="space-y-2">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => openArticle(article.id)}
                    className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No articles found</p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedArticle.title}
              </h2>
              <div className="text-gray-600 text-sm mb-6">
                Last updated:{" "}
                {new Date(selectedArticle.updated_at).toLocaleDateString()}
                {selectedArticle.kb_collections && (
                  <span className="ml-4">
                    Collection: {selectedArticle.kb_collections.name}
                  </span>
                )}
              </div>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(selectedArticle.content),
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Article
                </h3>
                <p>Choose an article from the sidebar to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
