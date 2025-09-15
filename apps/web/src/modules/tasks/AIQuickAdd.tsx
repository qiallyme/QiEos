import React, { useState } from "react";
import { api } from "../../lib/api";

interface AIQuickAddProps {
  onTaskCreated: (task: any) => void;
  onClose: () => void;
  projects?: Array<{ id: string; name: string; color: string }>;
}

export function AIQuickAdd({
  onTaskCreated,
  onClose,
  projects = [],
}: AIQuickAddProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await api.post("/ai/quick-add", {
        text: text.trim(),
        context: {
          projects: projects,
          timestamp: new Date().toISOString(),
        },
      });

      onTaskCreated((response as any).task);
      setText("");
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      // Fallback to regular task creation
      try {
        const response = await api.post("/tasks", {
          title: text.trim(),
          priority: 3,
        });
        onTaskCreated((response as any).task);
        setText("");
        onClose();
      } catch (fallbackError) {
        console.error("Fallback task creation failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (text.length < 3) return;

    try {
      const response = await api.post("/ai/suggest", {
        context: {
          current_input: text,
          projects: projects,
        },
        limit: 3,
      });

      setSuggestions((response as any).suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setText(suggestion.title);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">AI Quick Add</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your task in natural language
            </label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value.length >= 3) {
                  loadSuggestions();
                } else {
                  setShowSuggestions(false);
                }
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (text.length >= 3) {
                  setShowSuggestions(true);
                }
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 'Buy groceries tomorrow p2', 'Fix login bug urgent', 'Review quarterly report #work'"
              autoFocus
            />

            {/* AI Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2">
                    AI Suggestions:
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {suggestion.reasoning}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  AI-Powered Task Creation
                </h4>
                <div className="mt-1 text-sm text-blue-700">
                  <p>• Use natural language: "Buy groceries tomorrow"</p>
                  <p>• Set priorities: "p1" for urgent, "p4" for low</p>
                  <p>• Add labels: "#work #important"</p>
                  <p>• Set due dates: "today", "tomorrow", "next week"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Create with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

