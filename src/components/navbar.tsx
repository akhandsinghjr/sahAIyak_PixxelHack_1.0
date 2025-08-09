import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Brain, Zap } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { azureAIServices } from "@/services/azure-ai";

const Navbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Helper to determine if a link is active
  const isActive = (path: string) => location.pathname === path;
  
  // Test Groq connection function
  const testGroqConnection = async () => {
    setTestingConnection(true);
    try {
      console.log("Testing Groq connection...");
      const isValid = await azureAIServices.validateApiConnection();
      
      if (isValid) {
        toast({
          title: "✅ Groq Connection Success",
          description: "Successfully connected to Groq Llama API. All systems operational!",
          duration: 5000,
        });
        console.log("Groq connection test: SUCCESS");
      } else {
        toast({
          title: "❌ Groq Connection Failed",
          description: "Unable to validate Groq API connection. Check your API key and network.",
          variant: "destructive",
          duration: 7000,
        });
        console.log("Groq connection test: FAILED");
      }
    } catch (error) {
      console.error("Groq connection test error:", error);
      toast({
        title: "❌ Groq Connection Error",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={testGroqConnection}
            disabled={testingConnection}
            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Test Groq API Connection"
          >
            <Zap className={`h-4 w-4 mr-1 ${testingConnection ? 'animate-pulse' : ''}`} />
            {testingConnection ? 'Testing...' : 'Test API'}
          </Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
