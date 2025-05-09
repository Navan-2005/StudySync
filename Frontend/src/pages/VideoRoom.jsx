import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import ChatbotComp from "../components/ai/ChatbotComp";
import VoiceRecorderComponent from "../Components/VoiceRecorderComponent";
import MusicPlayer from '../pages/MusicPlayer';
import { FaQuestionCircle } from 'react-icons/fa';
import SessionSummaryComponent from '../components/ai/SessionSummaryComponent';

function generateRoomID() {
  return Math.random().toString(36).substring(2, 8);
}

export default function App() {
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const containerRef = useRef(null);
  const [transcriptionData, setTranscriptionData] = useState('');

  // Check if user is already in a room
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomID = params.get('roomID');
    const urlUserName = params.get('userName');
    
    if (urlRoomID) {
      setRoomID(urlRoomID);
      
      // If userName is provided in URL params, use it
      if (urlUserName) {
        setUserName(decodeURIComponent(urlUserName));
        // If we're already on a room URL with userName, prepare to join the video
        setJoined(true);
      }
    }
  }, []);

  const handleJoinViaUrl = () => {
    if (inputUrl && userName.trim()) {
      try {
        // Clean up the URL input first
        let url = inputUrl.trim();
        
        // Check if it's a full URL or just a path
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          // If it's just a room ID or path
          if (url.includes('roomID=')) {
            // It might be just the query part
            url = window.location.origin + '/room?' + url.split('?').pop();
          } else if (url.startsWith('/')) {
            // It's a path starting with /
            url = window.location.origin + url;
          } else {
            // Assume it's a room ID directly
            url = window.location.origin + '/room?roomID=' + url;
          }
        }
        
        // Create a URL object to properly handle the parameters
        const urlObj = new URL(url);
        
        // Make sure we have a roomID parameter
        const params = new URLSearchParams(urlObj.search);
        if (!params.has('roomID')) {
          alert('Invalid room URL. Please check and try again.');
          return;
        }
        
        // Add userName parameter if it doesn't exist
        if (!params.has('userName') && userName.trim()) {
          params.set('userName', encodeURIComponent(userName.trim()));
          urlObj.search = params.toString();
        }
        
        // Navigate to the URL
        window.location.href = urlObj.toString();
      } catch (error) {
        console.error('Error parsing URL:', error);
        alert('Invalid room URL. Please check and try again.');
      }
    } else {
      // Alert if username is missing
      if (!userName.trim()) {
        alert('Please enter your name before joining.');
      }
    }
  };

  const createRoom = () => {
    const newRoomID = generateRoomID();
    setRoomID(newRoomID);
  };

  const joinRoom = () => {
    if (!roomID) {
      // Generate a room ID if none exists
      const newRoomID = generateRoomID();
      setRoomID(newRoomID);
      window.location.href = `/room?roomID=${newRoomID}`;
    } else {
      // Navigate to the room with the existing room ID
      window.location.href = `/room?roomID=${roomID}`;
    }
  };

  const handleJoinVideoRoom = () => {
    if (userName.trim()) {
      if (!roomID) {
        // Generate a room ID if none exists
        const newRoomID = generateRoomID();
        setRoomID(newRoomID);
      }
      
      // Just join in the current tab
      setJoined(true);
    } else {
      alert('Please enter your name before joining.');
    }
  };

  // This would be called when receiving transcription data from the VoiceRecorderComponent
  const handleReceiveTranscriptionData = (data) => {
    setTranscriptionData(data);
  };

  useEffect(() => {
    if (joined && containerRef.current && userName.trim() && roomID) {
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
      
      // Make sure zp is created successfully before trying to join room
      if (zp) {
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Room Link',
              url: `${window.location.origin}/room?roomID=${roomID}&userName=${encodeURIComponent(userName)}`,
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
            
            // Simulating receiving transcription data when leaving the room
            // In a real app, this would come from your VoiceRecorderComponent
            // For demonstration purposes, we're using mock data
            const mockTranscription = "Today we discussed the project timeline for the new feature release. Sarah mentioned we need to finish the UI components by Friday. John suggested we should add automated testing for critical paths. We all agreed that the documentation needs to be updated before the release. Alex will handle the backend API changes, and Emma will coordinate with the QA team for testing. The team decided to have daily stand-ups at 10 AM to track progress. We also discussed potential challenges with the database migration, and Michael proposed a solution using a phased rollout approach.";
            setTranscriptionData(mockTranscription);
          },
        });

        // Show chatbot after joining the room
        setShowChatbot(true);
      } else {
        console.error("Failed to create ZEGO instance");
      }
    }
  }, [joined, roomID, userName]);

  if (hasLeft) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4 py-8">
        <div className="max-w-md w-full mb-8">
          <SessionSummaryComponent 
            transcriptionData={transcriptionData} 
          />
        </div>
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-6">👋 Meeting Ended</h2>
          <button 
            onClick={() => window.location.href = '/room'} 
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
            
            {/* Create Room Button */}
            <button 
              onClick={createRoom} 
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-300"
            >
              🔗 Create Room
            </button>
            
            {/* Room URL Display */}
            {roomID && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg break-all">
                <p className="text-gray-300 text-sm mb-1">Room URL:</p>
                <p className="text-white font-mono text-sm">
                  http://localhost:8080/room?roomID={roomID}&userName={encodeURIComponent(userName || 'YourName')}
                </p>
              </div>
            )}
            
            <div className="flex space-x-4">
              {/* Join Room Button */}
              <button 
                onClick={handleJoinVideoRoom} 
                disabled={!userName.trim()}
                className="w-1/2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-300"
              >
                🚪 Join Room
              </button>
              
              {/* Join via Link Button */}
              <button 
                onClick={() => setShowUrlInput(true)}
                disabled={!userName.trim()}
                className="w-1/2 py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-300"
              >
                🔗 Join via Link
              </button>
            </div>
          </div>
          
          {/* URL Input Modal */}
          {showUrlInput && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Enter Room URL</h3>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste the room URL here"
                  className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleJoinViaUrl}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-300"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => setShowUrlInput(false)}
                    className="py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
       {joined && (
        <VoiceRecorderComponent 
          onTranscriptionComplete={handleReceiveTranscriptionData}
        />
      )}
      <MusicPlayer />
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