import { useRef, useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Bold } from 'lucide-react';

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

function App() {
  function randomID(len: number) {
    let result = '';
    const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
    const maxPos = chars.length;
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
  }

  const roomID = getUrlParams().get('roomID') || randomID(5);
  const meetingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initMeeting = async () => {
      const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID);
      const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        randomID(5),
        randomID(5)
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: meetingRef.current!,
        sharedLinks: [
          {
            name: 'Personal link',
            url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
      });
    };

    if (meetingRef.current) {
      initMeeting();
    }

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
  }, [roomID]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100 text-gray-800 overflow-hidden">
     
      <header className="text-center text-xl py-4 animate-fadeIn">
     
          🎥 Welcome to <span className="text-blue-600" >Face2Face</span> ✨
     
      </header>

     
      <div
        ref={meetingRef}
        className="flex-grow w-full h-full bg-white rounded-t-lg"
      />
    </div>
  );
}

export default App;
