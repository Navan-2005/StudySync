import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { startTimer, pauseTimer, resetTimer, updateTimer } from "../../Redux/features/PomodoroSlice";

export function PomodoroTimer() {
  const dispatch = useDispatch();
  
  // Handle potential undefined state by providing default values
  const pomodoroState = useSelector((state) => state?.pomodoro);
  
  // Default values if Redux store is not ready
  const minutes = pomodoroState?.minutes ?? 25;
  const seconds = pomodoroState?.seconds ?? 0;
  const isActive = pomodoroState?.isActive ?? false;
  const progress = pomodoroState?.progress ?? 0;
  const mode = pomodoroState?.mode ?? 'work';

  useEffect(() => {
    // Update timer every second when active
    let interval = null;
    
    if (isActive && pomodoroState) {
      interval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, dispatch, pomodoroState]);

  // Background timer update - runs when component is mounted or re-rendered
  useEffect(() => {
    // Only dispatch if Redux store is initialized
    if (pomodoroState) {
      // Update timer to account for time passed while away
      dispatch(updateTimer());
      
      // Setup an interval that runs even when not focused on component
      const backgroundInterval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
      
      return () => clearInterval(backgroundInterval);
    }
  }, [dispatch, pomodoroState]);

  const toggleTimer = () => {
    if (!pomodoroState) return;
    
    if (isActive) {
      dispatch(pauseTimer());
    } else {
      dispatch(startTimer());
    }
  };

  const handleReset = () => {
    if (!pomodoroState) return;
    dispatch(resetTimer());
  };

  const timerColor = mode === 'work' ? 'text-blue-500' : 'text-green-500';

  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-medium mb-2">
        {mode === 'work' ? 'Work Session' : 'Break Time'}
      </div>
      
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
            className={`transition-all duration-1000 ease-linear ${timerColor}`}
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
          className={`hover:opacity-90 rounded-full w-14 h-14 ${mode === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}
          size="icon"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </Button>
        
        <Button
          onClick={handleReset}
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