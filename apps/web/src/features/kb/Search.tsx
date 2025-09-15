import React, { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchResult {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  updated: string;
  path: string;
  body: string;
}

interface SearchProps {
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export const Search: React.FC<SearchProps> = ({
  onResultClick,
  className = "",
}) => {
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load search index
    setIsLoading(true);
    fetch("/kb/_meta/search-index.json")
      .then((response) => response.json())
      .then((data) => {
        setSearchIndex(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load search index:", error);
        setIsLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || searchIndex.length === 0) return [];

    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);

    return searchIndex
      .map((item) => {
        const searchableText = `${item.title} ${item.summary} ${
          item.body
        } ${item.tags.join(" ")}`.toLowerCase();
        const score = searchTerms.reduce((score, term) => {
          if (item.title.toLowerCase().includes(term)) score += 10;
          if (item.summary.toLowerCase().includes(term)) score += 5;
          if (item.tags.some((tag) => tag.toLowerCase().includes(term)))
            score += 3;
          if (searchableText.includes(term)) score += 1;
          return score;
        }, 0);

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [query, searchIndex]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default behavior: navigate to the result
      window.location.href = `/kb${result.path.replace(".md", "")}`;
    }
    setIsOpen(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading search index...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {result.title}
                  </div>
                  {result.summary && (
                    <div className="text-sm text-gray-600 mb-2">
                      {result.summary}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{result.updated}</span>
                    {result.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {result.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-100 rounded text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
