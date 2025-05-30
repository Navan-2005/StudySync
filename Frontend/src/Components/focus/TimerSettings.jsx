import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { setCustomTimer } from "../../store/pomodoroSlice";

export function TimerSettings() {
  const dispatch = useDispatch();
  const { workDuration, breakDuration } = useSelector((state) => state.pomodoro);
  
  const [workMinutes, setWorkMinutes] = useState(workDuration);
  const [breakMinutes, setBreakMinutes] = useState(breakDuration);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    dispatch(setCustomTimer({
      workDuration: Number(workMinutes),
      breakDuration: Number(breakMinutes)
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Timer Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="workDuration">Work Duration (minutes)</Label>
          <Input
            id="workDuration"
            type="number"
            value={workMinutes}
            onChange={(e) => setWorkMinutes(e.target.value)}
            min="1"
            max="60"
            className="mt-1"
          />
        </div>
        
        <div className="mb-6">
          <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
          <Input
            id="breakDuration"
            type="number"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            min="1"
            max="30"
            className="mt-1"
          />
        </div>
        
        <Button type="submit" className="w-full">
          Save Settings
        </Button>
      </form>
    </div>
  );
}