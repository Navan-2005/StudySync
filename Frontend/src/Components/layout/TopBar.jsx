import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Bell, Timer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { MiniTimer } from "@/components/focus/MiniTimer";

export function TopBar({ roomName = "Study Room #1", className }) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [timerActive, setTimerActive] = useState(false);

  return (
    <div className={`w-full bg-white shadow-sm py-3 px-5 flex justify-between items-center ${className}`}>
      <div>
        <h1 className="font-semibold">{roomName}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className={`px-3 py-2 rounded-lg flex items-center gap-2 ${timerActive ? 'bg-brand-purple/10' : 'bg-gray-100'}`}>
        <MiniTimer />
         
          
        </div>

        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            size="icon"
            onClick={() => setMicOn(!micOn)}
            className={micOn ? "" : "bg-red-50 text-red-500 border-red-200"}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </Button> */}

          {/* <Button
            variant="outline"
            size="icon"
            onClick={() => setVideoOn(!videoOn)}
            className={videoOn ? "" : "bg-red-50 text-red-500 border-red-200"}
          >
            {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
          </Button> */}

          <Button variant="outline" size="icon">
            <Bell size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}