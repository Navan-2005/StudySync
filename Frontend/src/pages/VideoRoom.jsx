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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-border animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-primary text-transparent bg-clip-text mb-6">👋 Meeting Ended</h2>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-gradient-primary hover:opacity-90 text-white font-medium py-2 px-6 rounded-md transition duration-300 animate-float"
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
      <div className="flex items-center justify-center h-screen bg-brand-background p-4">
        <div className="bg-brand-card rounded-lg shadow-lg p-8 max-w-md w-full animate-fade-in border border-border">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-text mb-2">
              🎥 <span className="bg-gradient-primary text-transparent bg-clip-text">Unique</span> — Video Space
            </h1>
            <p className="text-brand-textSecondary mb-8">Where Students <span className="text-brand-teal font-semibold animate-pulse-light">Connect 🚀</span></p>
            
            <h2 className="text-xl text-brand-text mb-6">Enter Your Name to Join</h2>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="👤 Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 rounded-md bg-background text-brand-text border border-input focus:border-brand-purple focus:ring-2 focus:ring-brand-purple focus:outline-none"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!userName.trim()}
                className="w-full bg-gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              >
                🚪 Join Room
              </button>
            </form>
            
            <div className="mt-6 p-3 bg-background rounded-md border border-border">
              <p className="text-brand-textSecondary">Room ID: <span className="font-mono text-brand-purple font-semibold">{roomID}</span></p>
              <p className="text-xs text-brand-textSecondary mt-2">Share this Room ID with others to join the same room</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the video container
  return (
    <div className="h-screen bg-background">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}