import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { updateTimer } from "../../Redux/features/PomodoroSlice"; // Adjust the import path as needed

export function MiniTimer() {
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state.pomodoro);
  
  // Initialize local state with default values
  const [timerState, setTimerState] = useState({
    minutes: 25,
    seconds: 0,
    mode: 'work',
    isActive: false
  });
  
  useEffect(() => {
    if (!reduxState) return;
    
    dispatch(updateTimer());
    
    const interval = setInterval(() => {
      dispatch(updateTimer());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [dispatch, reduxState]);
  
  useEffect(() => {
    if (reduxState) {
      setTimerState({
        minutes: reduxState.minutes,
        seconds: reduxState.seconds,
        mode: reduxState.mode,
        isActive: reduxState.isActive
      });
    }
  }, [reduxState]);
  
  const { minutes, seconds, mode, isActive } = timerState;
  const timerColor = mode === 'work' ? 'text-blue-500' : 'text-green-500';
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
      <div className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''} ${timerColor}`}></div>
      <span className="font-medium">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-gray-500">
        {mode === 'work' ? 'Work' : 'Break'}
      </span>
    </div>
  );
}