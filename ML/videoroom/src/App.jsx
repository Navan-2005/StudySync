import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './App.css';

function getRoomID() {
  const params = new URLSearchParams(window.location.search);
  let roomID = params.get('roomID');
  if (!roomID) {
    roomID = Math.random().toString(36).substring(2, 8);
    window.history.replaceState(null, '', `?roomID=${roomID}`);
  }
  return roomID;
}

export default function App() {
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);
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
            url: `${window.location.origin}?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        onLeaveRoom: () => {
          setHasLeft(true);
          setJoined(false);
          setUserName('');
        },
      });
    }
  }, [joined]);
  if (hasLeft) {
    return (
      <div className="exit-screen">
        <div className="exit-box">
          <h2>👋 Meeting Ended</h2>
          <button onClick={() => window.location.href = '/'}>🏠 Go to Home</button>
        </div>
      </div>
    );
  }
  
  
  
  

  if (!joined) {
    return (
      <div className="form-container dark-theme animate-fade-slide">
        <h1 className="app-title">
          🎥 <span className="highlight">Unique</span> — A Video Space Where Students <span className="connect">Connect 🚀</span>
        </h1>
        <h2>Enter Your Name to Join</h2>
        <input
          type="text"
          placeholder="👤 Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button onClick={() => setJoined(true)} disabled={!userName.trim()}>
          🚪 Join Room
        </button>
        <p className="room-id-text">Room ID: <strong>{roomID}</strong></p>
      </div>
    );
  }

  return <div ref={containerRef} className="myCallContainer" />;
}
