import { Dashboard } from "@/components/Dashboard";
import { Focus } from "lucide-react";
import { PomodoroTimer } from "../components/focus/PomodoroTimer";

const Focuss = () => {
  return (
    <Dashboard>
      <PomodoroTimer />
    </Dashboard>
  );
};

export default Focuss;