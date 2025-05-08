import React, { useRef, useState, useEffect } from "react";
import { Play, Square, SkipForward, Music } from "lucide-react";

const MusicPlayer = () => {
  const audioFiles = [
    "/music/Binural.mp3",
    "/music/Gamma.mp3",
    "/music/Rainmusic.mp3",
  ];

  const trackNames = [
    "Binural",
    "Gamma",
    "Rainmusic"
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(new Audio(audioFiles[0]));
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle audio ended event to automatically play next track
  useEffect(() => {
    const handleAudioEnded = () => nextAudio();
    
    audioRef.current.addEventListener('ended', handleAudioEnded);
    
    return () => {
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current.pause();
    };
  }, [currentTrackIndex]);

  const playAudio = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const nextAudio = () => {
    stopAudio();
    const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
    setCurrentTrackIndex(nextIndex);
    audioRef.current = new Audio(audioFiles[nextIndex]);
    audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center mb-3">
        <Music className="text-indigo-500 mr-2" size={20} />
        <p className="text-gray-700 font-medium">
          {trackNames[currentTrackIndex]}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={playAudio}
          disabled={isPlaying}
          className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 flex items-center justify-center text-white shadow-md transition-all duration-200"
          aria-label="Play"
        >
          <Play size={24} fill="white" />
        </button>
        
        <button
          onClick={stopAudio}
          className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-md transition-all duration-200"
          aria-label="Stop"
        >
          <Square size={20} />
        </button>
        
        <button
          onClick={nextAudio}
          className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white shadow-md transition-all duration-200"
          aria-label="Next"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;