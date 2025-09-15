import React, { useState } from "react";
import {
  ExternalLink,
  Database,
  Cloud,
  Settings,
  Monitor,
  Shield,
  Mail,
  CreditCard,
  FileText,
  Users,
  BarChart3,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface QuicklinkItem {
  name: string;
  url: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  isExternal?: boolean;
}

interface QuicklinkCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: QuicklinkItem[];
}

const quicklinkCategories: QuicklinkCategory[] = [
  {
    name: "Database & Backend",
    icon: Database,
    items: [
      {
        name: "Supabase Dashboard",
        url: "https://supabase.com/dashboard/org/azbjgzfcumdtjsdorkri",
        description: "Database management, auth, and API",
        icon: Database,
        category: "database",
        isExternal: true,
      },
      {
        name: "Supabase SQL Editor",
        url: "https://supabase.com/dashboard/org/azbjgzfcumdtjsdorkri/projects",
        description: "Run SQL queries and manage schema",
        icon: FileText,
        category: "database",
        isExternal: true,
      },
      {
        name: "Database Migrations",
        url: "/admin/migrations",
        description: "Local migration management",
        icon: Settings,
        category: "database",
      },
    ],
  },
  {
    name: "Cloud Infrastructure",
    icon: Cloud,
    items: [
      {
        name: "Cloudflare Dashboard",
        url: "https://dash.cloudflare.com",
        description: "Workers, Pages, and R2 storage",
        icon: Cloud,
        category: "infrastructure",
        isExternal: true,
      },
      {
        name: "Cloudflare Workers",
        url: "https://dash.cloudflare.com/workers",
        description: "API endpoints and serverless functions",
        icon: Monitor,
        category: "infrastructure",
        isExternal: true,
      },
      {
        name: "Cloudflare Pages",
        url: "https://dash.cloudflare.com/pages",
        description: "Static site hosting and deployments",
        icon: FileText,
        category: "infrastructure",
        isExternal: true,
      },
      {
        name: "R2 Storage",
        url: "https://dash.cloudflare.com/r2",
        description: "File storage and CDN",
        icon: Database,
        category: "infrastructure",
        isExternal: true,
      },
    ],
  },
  {
    name: "Development Tools",
    icon: Settings,
    items: [
      {
        name: "GitHub Repository",
        url: "https://github.com/your-org/qieos",
        description: "Source code and issues",
        icon: FileText,
        category: "development",
        isExternal: true,
      },
      {
        name: "Local Development",
        url: "http://localhost:5173",
        description: "Web app development server",
        icon: Monitor,
        category: "development",
      },
      {
        name: "API Development",
        url: "http://localhost:8787",
        description: "Worker API development server",
        icon: Settings,
        category: "development",
      },
      {
        name: "Electron Cockpit",
        url: "/admin-electron",
        description: "Desktop admin application",
        icon: Monitor,
        category: "development",
      },
    ],
  },
  {
    name: "Monitoring & Analytics",
    icon: BarChart3,
    items: [
      {
        name: "System Logs",
        url: "/admin/auditor",
        description: "Application logs and monitoring",
        icon: FileText,
        category: "monitoring",
      },
      {
        name: "Performance Metrics",
        url: "/admin/dashboard",
        description: "System performance dashboard",
        icon: BarChart3,
        category: "monitoring",
      },
      {
        name: "Error Tracking",
        url: "https://sentry.io",
        description: "Error monitoring and alerts",
        icon: Shield,
        category: "monitoring",
        isExternal: true,
      },
    ],
  },
  {
    name: "Business Tools",
    icon: Users,
    items: [
      {
        name: "CRM Dashboard",
        url: "/admin/crm",
        description: "Customer relationship management",
        icon: Users,
        category: "business",
      },
      {
        name: "Billing & Invoices",
        url: "/admin/billing-desk",
        description: "Financial management",
        icon: CreditCard,
        category: "business",
      },
      {
        name: "Email Management",
        url: "https://mail.google.com",
        description: "Business email and communications",
        icon: Mail,
        category: "business",
        isExternal: true,
      },
      {
        name: "Project Management",
        url: "/admin/projects",
        description: "Project tracking and tasks",
        icon: FileText,
        category: "business",
      },
    ],
  },
];

export const AdminQuicklinks: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Database & Backend", "Cloud Infrastructure"])
  );
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = quicklinkCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  const handleLinkClick = (item: QuicklinkItem) => {
    if (item.isExternal) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = item.url;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Quicklinks
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.name);
          const CategoryIcon = category.icon;

          return (
            <div
              key={category.name}
              className="border border-gray-200/50 rounded-lg bg-white/30 backdrop-blur-sm"
            >
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/20 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CategoryIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.items.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleLinkClick(item)}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/40 transition-all duration-200 group border border-transparent hover:border-blue-200/50"
                        >
                          <div className="flex-shrink-0">
                            <ItemIcon className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800 group-hover:text-blue-700">
                                {item.name}
                              </span>
                              {item.isExternal && (
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {searchTerm && filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No services found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};
