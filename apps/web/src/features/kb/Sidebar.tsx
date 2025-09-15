import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  FileCheck,
  Play,
  Megaphone,
} from "lucide-react";

interface NavSection {
  label: string;
  paths: string[];
}

interface SidebarProps {
  className?: string;
}

const sectionIcons = {
  "Start Here": BookOpen,
  Policies: FileCheck,
  Templates: FileText,
  Playbooks: Play,
  Releases: Megaphone,
};

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const [navData, setNavData] = useState<NavSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Start Here"])
  );
  const location = useLocation();

  useEffect(() => {
    // Load navigation data from nav.yaml
    fetch("/kb/_meta/nav.yaml")
      .then((response) => response.text())
      .then((yamlText) => {
        // Simple YAML parsing for our specific structure
        const sections: NavSection[] = [];
        const lines = yamlText.split("\n");
        let currentSection: NavSection | null = null;

        for (const line of lines) {
          if (line.includes("label:")) {
            if (currentSection) sections.push(currentSection);
            currentSection = {
              label: line.split('"')[1] || line.split("'")[1] || "",
              paths: [],
            };
          } else if (line.includes('- "/') && currentSection) {
            const path = line.trim().replace('- "', "").replace('"', "");
            currentSection.paths.push(path);
          }
        }

        if (currentSection) sections.push(currentSection);
        setNavData(sections);
      })
      .catch((error) => {
        console.error("Failed to load navigation:", error);
        // Fallback navigation
        setNavData([
          { label: "Start Here", paths: ["/articles/welcome.md"] },
          { label: "Policies", paths: ["/policies/tax-engagement-letter.md"] },
          { label: "Templates", paths: [] },
          { label: "Playbooks", paths: [] },
        ]);
      });
  }, []);

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionLabel)) {
        newSet.delete(sectionLabel);
      } else {
        newSet.add(sectionLabel);
      }
      return newSet;
    });
  };

  const getPathFromLocation = (path: string) => {
    // Convert markdown path to KB route
    const cleanPath = path.replace(/\.md$/, "");
    return `/kb${cleanPath}`;
  };

  const isActive = (path: string) => {
    const kbPath = getPathFromLocation(path);
    return location.pathname === kbPath;
  };

  return (
    <div
      className={`w-64 bg-white border-r border-gray-200 h-full overflow-y-auto ${className}`}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Knowledge Base
        </h2>

        <nav className="space-y-2">
          {navData.map((section) => {
            const Icon =
              sectionIcons[section.label as keyof typeof sectionIcons] ||
              FileText;
            const isExpanded = expandedSections.has(section.label);

            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && section.paths.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.paths.map((path) => {
                      const title =
                        path.split("/").pop()?.replace(".md", "") || "";
                      const displayTitle = title
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ");

                      return (
                        <Link
                          key={path}
                          to={getPathFromLocation(path)}
                          className={`block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors ${
                            isActive(path)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : ""
                          }`}
                        >
                          {displayTitle}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
