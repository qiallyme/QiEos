import { Home, Settings, Database, Users, FileText } from "lucide-react";
import { Button } from "../button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Knowledge Base", href: "/kb", icon: Database },
  { name: "Users", href: "/users", icon: Users },
  { name: "Documents", href: "/docs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <div
      className={cn(
        "glass border-r border-white/10 transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-white/10",
                    isOpen ? "px-3" : "px-2"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
