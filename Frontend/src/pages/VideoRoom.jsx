import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import ChatbotComp from "../components/ai/ChatbotComp";
import { FaQuestionCircle } from  'react-icons/fa'

function getRoomID() {
  const params = new URLSearchParams(window.location.search);
  let roomID = params.get('roomID');
  if (!roomID) {
    roomID = Math.random().toString(36).substring(2, 8);
    window.history.replaceState(null, '', `/room?roomID=${roomID}`);
  }
  return roomID;
}


export default function App() {
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const roomID = getRoomID();
  const containerRef = useRef(null);

  useEffect(() => {
    if (joined && containerRef.current) {
      const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        Math.random().toString(36).substring(2, 10),
        userName
      );
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Room Link',
            url: `${window.location.origin}/room?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        onLeaveRoom: () => {
          setHasLeft(true);
          setJoined(false);
          setUserName('');
          setShowChatbot(false);
        },
      });

      // Show chatbot after joining the room
      setShowChatbot(true);
    }
  }, [joined]);

  if (hasLeft) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-6">👋 Meeting Ended</h2>
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-300"
          >
            🏠 Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            🎥 <span className="text-indigo-400">Unique</span>
          </h1>
          <p className="text-center text-gray-300 mb-8">
            A Video Space Where Students <span className="text-indigo-400">Connect 🚀</span>
          </p>
          
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Enter Your Name to Join
          </h2>
          
          <div className="space-y-6">
            <input
              type="text"
              placeholder="👤 Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <button 
              onClick={() => setJoined(true)} 
              disabled={!userName.trim()}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-300"
            >
              🚪 Join Room
            </button>
            
            <p className="text-gray-400 text-center pt-4">
              Room ID: <strong className="text-white">{roomID}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef} 
        className="w-full h-screen bg-gray-900" 
      />
      <div className="fixed bottom-24 right-6 flex flex-col gap-4 items-end z-50">
        <button
          onClick={() => window.location.href = '/quizroom'}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <FaQuestionCircle className="text-lg" />
          <span>Q</span>
        </button>
        {showChatbot && <ChatbotComp />}
      </div>
    </>
  );
}