import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export function PomodoroTimer({
  initialMinutes = 25,
  initialSeconds = 0
}) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const totalSeconds = initialMinutes * 60 + initialSeconds;
  
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            // Timer completed
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
        
        // Calculate progress
        const remainingSeconds = minutes * 60 + seconds;
        const progressValue = (remainingSeconds / totalSeconds) * 100;
        setProgress(progressValue);
        
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, totalSeconds]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
    setProgress(100);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className="text-brand-purple transition-all duration-1000 ease-linear"
            strokeWidth="4"
            strokeDasharray={283}
            strokeDashoffset={283 - (progress / 100) * 283}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-4xl font-bold">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button
          onClick={toggleTimer}
          className="bg-gradient-primary hover:opacity-90 rounded-full w-14 h-14"
          size="icon"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </Button>
        
        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="rounded-full w-14 h-14"
        >
          <RotateCcw size={24} />
        </Button>
      </div>
    </div>
  );
}