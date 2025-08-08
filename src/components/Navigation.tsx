import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Brain, Home, MessageSquare, BarChart } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container flex justify-center items-center h-16 px-4">
        <div className="flex space-x-1 md:space-x-2">
          <Link
            to="/"
            className={`flex items-center justify-center flex-col md:flex-row px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
            }`}
          >
            <Home className="h-5 w-5 md:mr-2" />
            <span className="text-xs md:text-sm">Home</span>
          </Link>

          <Link
            to="/analysis"
            className={`flex items-center justify-center flex-col md:flex-row px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/analysis"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
            }`}
          >
            <BarChart className="h-5 w-5 md:mr-2" />
            <span className="text-xs md:text-sm">Analysis</span>
          </Link>

          <Link
            to="/chat"
            className={`flex items-center justify-center flex-col md:flex-row px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/chat"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
            }`}
          >
            <MessageSquare className="h-5 w-5 md:mr-2" />
            <span className="text-xs md:text-sm">Chat</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
