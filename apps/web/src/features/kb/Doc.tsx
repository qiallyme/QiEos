import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface DocProps {
  path: string;
  className?: string;
}

interface DocContent {
  frontmatter: Record<string, any>;
  content: string;
  isHtml: boolean;
}

export const Doc: React.FC<DocProps> = ({ path, className = '' }) => {
  const [docContent, setDocContent] = useState<DocContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [path]);

  const loadDocument = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine if this is an HTML file or markdown
      const isHtml = path.endsWith('.html');
      const fullPath = isHtml ? `/kb/assets/html/${path}` : `/kb${path}`;
      
      const response = await fetch(fullPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      if (isHtml) {
        // For HTML files, return as-is
        setDocContent({
          frontmatter: {},
          content,
          isHtml: true
        });
      } else {
        // Parse markdown with frontmatter
        const { data: frontmatter, content: markdownContent } = parseFrontmatter(content);
        
        // Convert markdown to HTML
        const htmlContent = marked(markdownContent);
        
        setDocContent({
          frontmatter,
          content: htmlContent,
          isHtml: false
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const parseFrontmatter = (content: string) => {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      const frontmatterText = match[1];
      const markdownContent = match[2];
      
      // Simple YAML parsing for basic frontmatter
      const frontmatter: Record<string, any> = {};
      const lines = frontmatterText.split('\n');
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Handle arrays
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(item => 
              item.trim().replace(/^["']|["']$/g, '')
            );
          }
          
          frontmatter[key] = value;
        }
      }
      
      return { data: frontmatter, content: markdownContent };
    }
    
    return { data: {}, content };
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Document</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!docContent) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="text-gray-500">Document not found</div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Frontmatter metadata */}
      {docContent.frontmatter.title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {docContent.frontmatter.title}
          </h1>
          
          {docContent.frontmatter.summary && (
            <p className="text-lg text-gray-600 mb-4">
              {docContent.frontmatter.summary}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {docContent.frontmatter.updated && (
              <span>Updated: {docContent.frontmatter.updated}</span>
            )}
            {docContent.frontmatter.tags && Array.isArray(docContent.frontmatter.tags) && (
              <div className="flex gap-2">
                {docContent.frontmatter.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document content */}
      <div className="prose prose-lg max-w-none">
        {docContent.isHtml ? (
          // For HTML files, render in iframe for security
          <iframe
            src={`/kb/assets/html/${path}`}
            className="w-full h-screen border border-gray-200 rounded-lg"
            title={docContent.frontmatter.title || 'Document'}
          />
        ) : (
          // For markdown, render sanitized HTML
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(docContent.content)
            }}
          />
        )}
      </div>
    </div>
  );
};
