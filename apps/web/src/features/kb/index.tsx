import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search } from "./Search";
import { Doc } from "./Doc";
import { KBHeader } from "./Header";
import { Breadcrumbs, useBreadcrumbs } from "./Breadcrumbs";

// Component to handle dynamic doc loading
const DocRoute: React.FC<{ section: string }> = ({ section }) => {
  const { slug } = useParams<{ slug: string }>();
  return <Doc path={`/${section}/${slug}.md`} />;
};

const HtmlRoute: React.FC = () => {
  const { filename } = useParams<{ filename: string }>();
  return <Doc path={`/assets/html/${filename}`} />;
};

export const KB: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs(location.pathname);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with search and dark mode */}
        <KBHeader
          onSearch={handleSearch}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          <Routes>
            {/* KB Home - redirect to welcome */}
            <Route
              path="/"
              element={<Navigate to="/kb/articles/welcome" replace />}
            />

            {/* Dynamic routes for KB content */}
            <Route
              path="/articles/:slug"
              element={<DocRoute section="articles" />}
            />
            <Route
              path="/policies/:slug"
              element={<DocRoute section="policies" />}
            />
            <Route
              path="/templates/:slug"
              element={<DocRoute section="templates" />}
            />
            <Route
              path="/playbooks/:slug"
              element={<DocRoute section="playbooks" />}
            />
            <Route
              path="/releases/:slug"
              element={<DocRoute section="releases" />}
            />

            {/* HTML assets */}
            <Route path="/assets/html/:filename" element={<HtmlRoute />} />

            {/* Fallback */}
            <Route
              path="*"
              element={
                <div className="text-center py-8 text-gray-500">
                  Page not found
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Export individual components for use in other parts of the app
export { Sidebar, Search, Doc };
