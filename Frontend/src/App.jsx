import { Toaster } from "@/Components/ui/toaster";
import { Toaster as Sonner } from "@/Components/ui/sonner";
import { TooltipProvider } from "@/Components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Index from "./Pages/Index";
import Dashboard from "./Pages/Dashboard";
import AIAssistant from "./Pages/AIAssistant";
import Leader from "./Pages/Leader";
import Focuss from "./Pages/Focuss";
import Video from "./Pages/Video";
import Materials from "./Pages/Materials";
import NotFound from "./Pages/NotFound";
import Quiz from './Pages/Quiz'
import Voice from './Components/layout/LectureVideoManager'
import QuizTaker from './Components/QuizTaker'
import QuizRoom from './Pages/Quiz'
import Mcq from './Pages/Mcqs'

import VideoRoom from "./Pages/VideoRoom";
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
          '<Route path="/mcq" element={<Mcq/>}/>
          
        
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