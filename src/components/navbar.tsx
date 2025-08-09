import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Brain } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  
  // Helper to determine if a link is active
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="w-full py-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Brain className="h-6 w-6 text-yellow-500" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-50">सह-<span className="text-yellow-500">AI</span>-यक</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/analysis">
            <Button 
              variant={isActive('/analysis') ? "default" : "ghost"} 
              size="sm"
              className={isActive('/analysis') ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Assessment
            </Button>
          </Link>
          <Link to="/chat">
            <Button 
              variant={isActive('/chat') ? "default" : "ghost"} 
              size="sm"
              className={isActive('/chat') ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              Chat
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
