import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./Pages/SignUp";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./Pages/AIAssistant";
import Leader from "./pages/Leader";
import Focuss from "./pages/Focuss";
import Video from "./pages/Video";
import Materials from "./pages/Materials";
import NotFound from "./pages/NotFound";
import Quiz from './pages/Quiz'
import Voice from './Components/layout/LectureVideoManager'
import QuizTaker from './Components/QuizTaker'
import QuizRoom from './Pages/QuizRoom'

import VideoRoom from "./pages/VideoRoom";
import { Focus } from "lucide-react";
import FlashcardApp from "./Components/layout/LectureVideoManager";

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
          <Route path="/room" element={<Video />} />
          <Route path="/leaderboard" element={<Leader />} />
          <Route path="/voice" element={<Voice/>}/>
        
          <Route path='/quiz' element={<Quiz />} />
          <Route path='/quiz/:id' element={<QuizTaker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/quizroom" element={<QuizRoom />} />
          <Route path='/flashcard' element={<FlashcardApp/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;