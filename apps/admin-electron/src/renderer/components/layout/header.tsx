import { Menu, X } from "lucide-react";
import { Button } from "../button";

interface HeaderProps {
  isSidebarOpen: boolean;
  onMenuToggle: () => void;
}

export function Header({ isSidebarOpen, onMenuToggle }: HeaderProps) {
  return (
    <header className="glass border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="text-white hover:bg-white/10"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-xl font-semibold text-white">QiPortals</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
