import { useState } from "react";
import { Sidebar } from "@/Components/layout/Sidebar";
import { TopBar } from "@/Components/layout/TopBar";

export function Dashboard({ children }) {
  const [currentTab, setCurrentTab] = useState("focus");
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <TopBar />
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}