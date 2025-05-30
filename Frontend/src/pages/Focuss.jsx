import { Dashboard } from "@/Components/Dashboard";
import { Focus } from "lucide-react";
import { PomodoroTimer } from "../Components/focus/PomodoroTimer";

const Focuss = () => {
  return (
    <Dashboard>
      <PomodoroTimer />
    </Dashboard>
  );
};

export default Focuss;