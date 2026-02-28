import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import RecommendPage from "./pages/RecommendPage";
import IntelligencePage from "./pages/IntelligencePage";
import NotFound from "./pages/NotFound";

import ChatBox from "./components/chatbox";
import { RecommendationProvider } from "./context/RecommendationContext";

const queryClient = new QueryClient();

function App() {
  return (
    <RecommendationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/recommend" element={<RecommendPage />} />
              <Route path="/intelligence" element={<IntelligencePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global Floating AI Assistant */}
            <ChatBox />
          </BrowserRouter>

        </TooltipProvider>
      </QueryClientProvider>
    </RecommendationProvider>
  );
}

export default App;