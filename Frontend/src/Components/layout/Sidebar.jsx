import { useEffect, useState } from "react";
import { Calendar, Focus, BarChart, BookUser, Users, TestTube, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { name: "Study Room", icon: Users, path: "/room" },
  { name: "Focus Mode", icon: Focus, path: "/focus" },
  { name: "AI Assistant", icon: BookUser, path: "/assistant" },
  { name: "Materials", icon: Calendar, path: "/materials" },
  { name: "Quiz Time", icon: TestTube, path: "/quizroom" },
  { name: "Leaderboard", icon: Smile, path: "/leaderboard" },
  { name: "Flash Cards", icon: Smile, path: "/voice" },
  // { name: "MCQ", icon: Smile, path: "/mcq" },

];

export function Sidebar({ className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState("/");
  const [collapsed, setCollapsed] = useState(false);

  // Set active path based on current location
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setActivePath(path);
  };

  return (
    <div
      className={cn(
        "h-screen bg-white shadow-md flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">FF</span>
            </div>
            <span className="font-poppins font-bold text-lg">FocusFriend</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">FF</span>
            </div>
          </div>
        )}
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-1", collapsed && "w-full mt-4")}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col flex-1 gap-2 px-3">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={activePath === item.path ? "secondary" : "ghost"}
            className={cn(
              "justify-start gap-3 py-6",
              activePath === item.path && "bg-brand-purple/10 text-brand-purple"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.name}</span>}
          </Button>
        ))}
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-medium">JS</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-medium text-sm">Jane Smith</span>
              <span className="text-xs text-brand-textSecondary">Student</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}