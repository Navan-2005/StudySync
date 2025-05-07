// import * as React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// function getRoomID() {
//   const params = new URLSearchParams(window.location.search);
//   let roomID = params.get('roomID');
//   if (!roomID) {
//     roomID = Math.random().toString(36).substring(2, 8);
//     window.history.replaceState(null, '', `?roomID=${roomID}`);
//   }
//   return roomID;
// }

// export default function VideoRoom() {
//   const [userName, setUserName] = useState('');
//   const [joined, setJoined] = useState(false);
//   const [hasLeft, setHasLeft] = useState(false);
//   const roomID = getRoomID();
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (joined && containerRef.current) {
//       const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
//       const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

//       const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//         appID,
//         serverSecret,
//         roomID,
//         Math.random().toString(36).substring(2, 10),
//         userName
//       );

//       const zp = ZegoUIKitPrebuilt.create(kitToken);
//       zp.joinRoom({
//         container: containerRef.current,
//         sharedLinks: [
//           {
//             name: 'Room Link',
//             url: `${window.location.origin}?roomID=${roomID}`,
//           },
//         ],
//         scenario: {
//           mode: ZegoUIKitPrebuilt.GroupCall,
//         },
//         onLeaveRoom: () => {
//           setHasLeft(true);
//           setJoined(false);
//           setUserName('');
//         },
//       });
//     }
//   }, [joined]);
//   if (hasLeft) {
//     return (
//       <div className="exit-screen">
//         <div className="exit-box">
//           <h2>👋 Meeting Ended</h2>
//           <button onClick={() => window.location.href = '/'}>🏠 Go to Home</button>
//         </div>
//       </div>
//     );
//   }
  
  
  
  

//   if (!joined) {
//     return (
//       <div className="form-container dark-theme animate-fade-slide">
//         <h1 className="app-title">
//           🎥 <span className="highlight">Unique</span> — A Video Space Where Students <span className="connect">Connect 🚀</span>
//         </h1>
//         <h2>Enter Your Name to Join</h2>
//         <input
//           type="text"
//           placeholder="👤 Your Name"
//           value={userName}
//           onChange={(e) => setUserName(e.target.value)}
//         />
//         <button onClick={() => setJoined(true)} disabled={!userName.trim()}>
//           🚪 Join Room
//         </button>
//         <p className="room-id-text">Room ID: <strong>{roomID}</strong></p>
//       </div>
//     );
//   }

//   return <div ref={containerRef} className="myCallContainer" />;
// }
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Function to get or create a room ID from URL params
function getRoomID() {
  const params = new URLSearchParams(window.location.search);
  let roomID = params.get('roomID');
  if (!roomID) {
    roomID = Math.random().toString(36).substring(2, 8);
    window.history.replaceState(null, '', `?roomID=${roomID}`);
  }
  return roomID;
}

export default function VideoRoom() {
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);
  const roomID = getRoomID();
  const containerRef = useRef(null);

  useEffect(() => {
    if (joined && containerRef.current) {
      // Get the app ID and server secret from environment variables
      // Make sure these are properly set in your .env file
      const appID = Number(import.meta.env.VITE_ZEGO_APP_ID || process.env.VITE_ZEGO_APP_ID);
      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || process.env.VITE_ZEGO_SERVER_SECRET;
      
      // Generate a unique user ID
      const userID = Math.random().toString(36).substring(2, 10);
      
      // Generate the token for authentication
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );
      
      // Create the Zego UI Kit instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      // Join the room
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Room Link',
            url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showScreenSharingButton: true,
        showPreJoinView: false, // Skip the pre-join view since we have our own
        onLeaveRoom: () => {
          setHasLeft(true);
          setJoined(false);
          setUserName('');
        },
      });
    }
  }, [joined, roomID, userName]);
  
  // Handle form submission
  const handleJoin = (e) => {
    e?.preventDefault();
    if (userName.trim()) {
      setJoined(true);
    }
  };

  // Handle key press in the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  // Render the exit screen
  if (hasLeft) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-6">👋 Meeting Ended</h2>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
          >
            🏠 Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Render the join form
  if (!joined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              🎥 <span className="text-blue-400">Unique</span> — Video Space
            </h1>
            <p className="text-gray-300 mb-8">Where Students <span className="text-green-400 font-semibold">Connect 🚀</span></p>
            
            <h2 className="text-xl text-white mb-6">Enter Your Name to Join</h2>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="👤 Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!userName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                🚪 Join Room
              </button>
            </form>
            
            <div className="mt-6 p-3 bg-gray-700 rounded-lg">
              <p className="text-gray-300">Room ID: <span className="font-mono text-white font-semibold">{roomID}</span></p>
              <p className="text-xs text-gray-400 mt-2">Share this Room ID with others to join the same room</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the video container
  return (
    <div className="h-screen bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}