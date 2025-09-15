import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Doc } from "./Doc";
import { getSearchIndex, searchDocs, SearchIndexItem } from "./content";

interface EmbeddedKBProps {
  clientSlug: string;
  onBack?: () => void;
  className?: string;
}

export const EmbeddedKB: React.FC<EmbeddedKBProps> = ({
  clientSlug,
  onBack,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchIndexItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredContent, setFilteredContent] = useState<SearchIndexItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    loadClientContent();
  }, [clientSlug]);

  const loadClientContent = async () => {
    try {
      const index = await getSearchIndex();
      if (!index) return;

      // Filter content for this specific client
      const clientContent = index.items.filter((item) => {
        // Check if the document is intended for this client
        return (
          item.audiences?.includes(clientSlug) ||
          item.tags?.includes(clientSlug) ||
          item.path.includes(clientSlug)
        );
      });

      setFilteredContent(clientContent);
    } catch (error) {
      console.error("Error loading client content:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchDocs(query);
      // Filter results for this client
      const clientResults = results.filter((item) => {
        return (
          item.audiences?.includes(clientSlug) ||
          item.tags?.includes(clientSlug) ||
          item.path.includes(clientSlug)
        );
      });
      setSearchResults(clientResults);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocSelect = (path: string) => {
    setSelectedDoc(path);
  };

  const handleBack = () => {
    if (selectedDoc) {
      setSelectedDoc(null);
    } else if (onBack) {
      onBack();
    }
  };

  // If a document is selected, show it
  if (selectedDoc) {
    return (
      <div
        className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Base
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {clientSlug} Portal
          </div>
        </div>

        {/* Document content */}
        <div className="flex-1 overflow-y-auto">
          <Doc path={selectedDoc} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Knowledge Base
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Resources for {clientSlug}
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Searching...</div>
          </div>
        ) : searchQuery ? (
          // Search results
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleDocSelect(item.path)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-2">
                        {item.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        ) : (
          // Default content list
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Available Resources ({filteredContent.length})
            </h3>
            {filteredContent.length > 0 ? (
              <div className="space-y-3">
                {filteredContent.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleDocSelect(item.path)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-2">
                        {item.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No content available for {clientSlug}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
