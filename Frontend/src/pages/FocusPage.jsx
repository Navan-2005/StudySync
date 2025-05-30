import { PomodoroTimer } from "../Components/focus/PomodoroTimer";
import { MiniTimer } from "../Components/focus/MiniTimer";
import { TimerSettings } from "../Components/focus/TimerSettings";

export default function FocusPage() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Focus Timer</h1>
        <MiniTimer />
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center items-center">
          <PomodoroTimer />
        </div>
        
        <div>
          <TimerSettings />
        </div>
      </div>
    </div>
  );
}