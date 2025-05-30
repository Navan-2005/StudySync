import { Button } from "@/Components/ui/button";
import { HeroSection } from "@/Components/home/HeroSection";
import { FeatureCard } from "@/Components/home/FeatureCard";
import { Bot, FileText, Headphones, Award } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Chat Assistant",
    description: "Get instant help with questions and study material using our voice-activated AI tutor."
  },
  {
    icon: FileText,
    title: "MCQ Generator from Notes",
    description: "Upload your notes and generate quizzes to test your knowledge and prepare for exams."
  },
  {
    icon: Headphones,
    title: "Focus Mode with Music",
    description: "Stay productive with a Pomodoro timer and focus music to maintain your concentration."
  },
  {
    icon: Award,
    title: "Leaderboard & Tests",
    description: "Track progress, compare with friends, and earn achievements for consistent studying."
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">FF</span>
            </div>
            <span className="font-poppins font-bold text-xl">FocusFriend</span>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-brand-textSecondary hover:text-brand-text transition-colors">Features</a>
            <a href="#features" className="text-brand-textSecondary hover:text-brand-text transition-colors">How It Works</a>
            <a href="#features" className="text-brand-textSecondary hover:text-brand-text transition-colors">Testimonials</a>
          </nav>
          
          <div className="flex gap-4">
            {/* <Button variant="ghost">Log In</Button> */}
            {/* <Button className="bg-gradient-primary hover:opacity-90">Sign Up</Button> */}
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto">
          <HeroSection />
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-3">Elevate Your Study Experience</h2>
              <p className="text-brand-textSecondary max-w-lg mx-auto">
                Our platform combines collaboration tools, focus techniques, and AI assistants to create the ultimate digital classroom.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* AI Zone Access */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button size="lg" className="rounded-full h-16 w-16 p-0 bg-gradient-primary hover:shadow-lg hover:scale-105 transition-all">
            <Bot size={28} />
          </Button>
        </div>
        
        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-primary">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Enter the Zone?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join thousands of students who are achieving their academic goals with FocusFriend.
            </p>
            <Button size="lg" className="bg-white text-brand-purple hover:bg-white/90">
              Get Started for Free
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FF</span>
                </div>
                <span className="font-poppins font-bold text-xl">FocusFriend</span>
              </div>
              <p className="text-brand-textSecondary max-w-xs">
                The ultimate digital classroom for collaborative studying and focused learning.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-brand-textSecondary">
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-brand-purple transition-colors">How It Works</a></li>
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-brand-textSecondary">
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Documentation</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-brand-textSecondary">
                  <li><a href="#" className="hover:text-brand-purple transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-brand-purple transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-brand-textSecondary text-sm">
              © 2025 FocusFriend. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-brand-textSecondary hover:text-brand-purple transition-colors">Privacy Policy</a>
              <a href="#" className="text-brand-textSecondary hover:text-brand-purple transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;