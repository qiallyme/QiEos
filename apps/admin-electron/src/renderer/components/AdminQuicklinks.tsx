import React, { useState } from 'react';

interface QuicklinkItem {
  name: string;
  url: string;
  description?: string;
  isExternal?: boolean;
}

interface QuicklinkCategory {
  name: string;
  items: QuicklinkItem[];
}

const quicklinkCategories: QuicklinkCategory[] = [
  {
    name: 'Database & Backend',
    items: [
      {
        name: 'Supabase Dashboard',
        url: 'https://supabase.com/dashboard/org/azbjgzfcumdtjsdorkri',
        description: 'Database management, auth, and API',
        isExternal: true
      },
      {
        name: 'Supabase SQL Editor',
        url: 'https://supabase.com/dashboard/org/azbjgzfcumdtjsdorkri/projects',
        description: 'Run SQL queries and manage schema',
        isExternal: true
      },
      {
        name: 'Database Migrations',
        url: '/migrations',
        description: 'Local migration management'
      }
    ]
  },
  {
    name: 'Cloud Infrastructure',
    items: [
      {
        name: 'Cloudflare Dashboard',
        url: 'https://dash.cloudflare.com',
        description: 'Workers, Pages, and R2 storage',
        isExternal: true
      },
      {
        name: 'Cloudflare Workers',
        url: 'https://dash.cloudflare.com/workers',
        description: 'API endpoints and serverless functions',
        isExternal: true
      },
      {
        name: 'Cloudflare Pages',
        url: 'https://dash.cloudflare.com/pages',
        description: 'Static site hosting and deployments',
        isExternal: true
      },
      {
        name: 'R2 Storage',
        url: 'https://dash.cloudflare.com/r2',
        description: 'File storage and CDN',
        isExternal: true
      }
    ]
  },
  {
    name: 'Development Tools',
    items: [
      {
        name: 'GitHub Repository',
        url: 'https://github.com/your-org/qieos',
        description: 'Source code and issues',
        isExternal: true
      },
      {
        name: 'Local Development',
        url: 'http://localhost:5173',
        description: 'Web app development server'
      },
      {
        name: 'API Development',
        url: 'http://localhost:8787',
        description: 'Worker API development server'
      }
    ]
  },
  {
    name: 'Business Tools',
    items: [
      {
        name: 'CRM Dashboard',
        url: '/crm',
        description: 'Customer relationship management'
      },
      {
        name: 'Billing & Invoices',
        url: '/billing-desk',
        description: 'Financial management'
      },
      {
        name: 'Email Management',
        url: 'https://mail.google.com',
        description: 'Business email and communications',
        isExternal: true
      },
      {
        name: 'Project Management',
        url: '/projects',
        description: 'Project tracking and tasks'
      }
    ]
  }
];

const AdminQuicklinks: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Database & Backend', 'Cloud Infrastructure'])
  );

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleLinkClick = (item: QuicklinkItem) => {
    if (item.isExternal) {
      window.electronAPI?.openExternal?.(item.url);
    } else {
      // Handle internal navigation
      window.location.hash = item.url;
    }
  };

  return (
    <div className="card card-spacing">
      <h2>Admin Quicklinks</h2>
      <div className="quicklinks-container">
        {quicklinkCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.name);

          return (
            <div key={category.name} className="quicklink-category">
              <button
                onClick={() => toggleCategory(category.name)}
                className="quicklink-category-header"
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.items.length})</span>
                <span className="category-toggle">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {isExpanded && (
                <div className="quicklink-items">
                  {category.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleLinkClick(item)}
                      className="quicklink-item"
                    >
                      <div className="quicklink-content">
                        <div className="quicklink-name">
                          {item.name}
                          {item.isExternal && ' ↗'}
                        </div>
                        {item.description && (
                          <div className="quicklink-description">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminQuicklinks;
