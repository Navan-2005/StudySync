import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Focuss from "./pages/Focuss";
import Materials from "./pages/Materials";
import NotFound from "./pages/NotFound";
import QuizGenerator from './components/QuizGenerator'
import QuizTaker from './Components/QuizTaker'
import { Focus } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/focus" element={<Focuss />} />
          <Route path="/materials" element={<Materials />} />
          <Route path='/quiz' element={<QuizGenerator />} />
          <Route path='/quiz/:id' element={<QuizTaker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;