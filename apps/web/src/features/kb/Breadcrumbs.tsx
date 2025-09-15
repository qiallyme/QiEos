import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = "",
}) => {
  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "KB", path: "/kb" }];

    let currentPath = "/kb";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Convert segment to readable label
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Don't make the last item clickable
      const isLast = index === segments.length - 1;

      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  // If items are provided, use them; otherwise generate from current path
  const breadcrumbItems =
    items.length > 0 ? items : generateBreadcrumbs(window.location.pathname);

  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <Home className="h-4 w-4" />

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}

          {item.path ? (
            <a
              href={item.path}
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Hook to generate breadcrumbs from current path
export const useBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "KB", path: "/kb" }];

  let currentPath = "/kb";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Convert segment to readable label
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Don't make the last item clickable
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
};
