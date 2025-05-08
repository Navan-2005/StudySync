import { useState } from "react";
import  LeaderData  from "../pages/LeaderData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Calendar, CheckCircle } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";

// Mock leaderboard data for different time periods
const timeFrames = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "allTime", label: "All Time" },
];

// Mock achievement data

export default function Leader() {
  const [timeFrame, setTimeFrame] = useState("weekly");
  
  return (
    <Dashboard>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
            <p className="text-gray-600 mt-1">See how you compare with other students</p>
          </div>
          <Tabs value={timeFrame} onValueChange={setTimeFrame}>
            <TabsList className="bg-gray-100">
              {timeFrames.map((frame) => (
                <TabsTrigger key={frame.id} value={frame.id}>
                  {frame.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
            
                <CardDescription>
                  {timeFrame === "weekly" && "Top performers for the past week"}
                  {timeFrame === "monthly" && "Top performers for the past month"}
                  {timeFrame === "allTime" && "All-time top performers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <LeaderData 
                    currentScore={86}
                    currentPosition={5} 
                    totalParticipants={43}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* <div>
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Medal className="h-5 w-5 text-amber-500" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Milestones you've reached and goals to achieve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.earned 
                          ? "border-amber-200 bg-amber-50" 
                          : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned 
                            ? "bg-amber-100 text-amber-600" 
                            : "bg-gray-200 text-gray-500"
                        }`}>
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.description}</div>
                          {achievement.earned && achievement.date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Earned on {achievement.date}
                            </div>
                          )}
                        </div>
                        {achievement.earned ? (
                          <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            Earned
                          </div>
                        ) : (
                          <div className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </Dashboard>
  );
}