import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Search } from './Search';
import { Doc } from './Doc';

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
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with search */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl">
            <Search />
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            {/* KB Home - redirect to welcome */}
            <Route path="/" element={<Navigate to="/kb/articles/welcome" replace />} />
            
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
            <Route 
              path="/assets/html/:filename" 
              element={<HtmlRoute />} 
            />
            
            {/* Fallback */}
            <Route path="*" element={<div className="text-center py-8 text-gray-500">Page not found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Export individual components for use in other parts of the app
export { Sidebar, Search, Doc };
