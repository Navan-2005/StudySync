import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-10 py-16 px-6 md:px-10">
      <div className="flex-1">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Enter the Zone: <span className="gradient-text">Study. Focus.</span> Grow.
        </h1>
        <p className="text-lg text-brand-textSecondary mb-8 max-w-lg">
          Join your friends virtually, crack MCQs from notes, and stay sharp with AI.
        </p>
        <div className="flex gap-4">
          <Button 
            size="lg"
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => navigate('/room')}
          >
            <Users className="mr-2" size={18} />
            Study Now
          </Button>
          {/* <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/room')}
          >
            Join Room
            <ArrowRight className="ml-2" size={18} />
          </Button> */}
        </div>
      </div>
      
      <div className="flex-1 relative">
        <div className="relative z-10 bg-white rounded-2xl shadow-lg p-6 max-w-md">
          <div className="flex gap-3 items-center mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-medium">FF</span>
            </div>
            <div>
              <h3 className="font-medium">Focus Friend</h3>
              <p className="text-sm text-brand-textSecondary">Study Room #1</p>
            </div>
            <div className="ml-auto bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
              Live
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-brand-purple">U{item}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary w-3/4"></div>
            </div>
            <span className="text-sm font-medium">45:12</span>
          </div>
        </div>
        
        <div className="absolute -z-0 w-full h-full rounded-2xl top-8 -right-8 bg-gradient-primary opacity-20 animate-pulse-light"></div>
        <div className="absolute -z-0 w-20 h-20 rounded-full -top-10 -left-10 bg-brand-teal opacity-20 animate-float"></div>
        <div className="absolute -z-0 w-16 h-16 rounded-full -bottom-6 right-20 bg-brand-purple opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}