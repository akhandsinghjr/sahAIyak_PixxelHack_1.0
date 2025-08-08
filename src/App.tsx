import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Analysis from "./pages/Analysis"; // Add import for the new Analysis page
import Navigation from "./components/Navigation";
import { ThemeProvider } from "@/components/theme-provider"
import Footer2 from "./components/Footer";

// In your app render function

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Navigation />
          
          <div className="pb-16 md:pb-0 md:pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/analysis" element={<Analysis />} /> {/* Add new route */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer2 />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider >
);

export default App;
