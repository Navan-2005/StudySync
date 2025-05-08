import React, { useRef, useState, useEffect } from "react";

const LectureVideoManager = () => {
  const [mediaFiles, setMediaFiles] = useState({
    videos: [],
    audios: []
  });
  const [recording, setRecording] = useState({
    video: false,
    audio: false
  });
  const [activeTab, setActiveTab] = useState("videos");
  const [isUploading, setIsUploading] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const previewRef = useRef(null);
  const audioRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);

  // Load saved media files from localStorage on initial render
  useEffect(() => {
    const savedVideos = JSON.parse(localStorage.getItem("lectureVideos")) || [];
    const savedAudios = JSON.parse(localStorage.getItem("lectureAudios")) || [];
    setMediaFiles({
      videos: savedVideos,
      audios: savedAudios
    });
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (recording.video || recording.audio) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingDuration(0);
    }

    return () => clearInterval(timerRef.current);
  }, [recording]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const saveMedia = (mediaBlob, type) => {
    const name = recordingName || `Recording-${new Date().toISOString()}`;
    const mediaUrl = URL.createObjectURL(mediaBlob);
    
    const mediaItem = {
      url: mediaUrl,
      name: name,
      type: mediaBlob.type,
      size: mediaBlob.size,
      date: new Date().toISOString()
    };

    if (type === 'video') {
      const updatedVideos = [...mediaFiles.videos, mediaItem];
      setMediaFiles(prev => ({ ...prev, videos: updatedVideos }));
      localStorage.setItem("lectureVideos", JSON.stringify(updatedVideos));
    } else if (type === 'audio') {
      const updatedAudios = [...mediaFiles.audios, mediaItem];
      setMediaFiles(prev => ({ ...prev, audios: updatedAudios }));
      localStorage.setItem("lectureAudios", JSON.stringify(updatedAudios));
    }
    
    setRecordingName("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(file);
      const mediaItem = {
        url: fileUrl,
        name: file.name,
        type: file.type,
        size: file.size,
        date: new Date().toISOString()
      };
      
      if (file.type.includes("video")) {
        const updatedVideos = [...mediaFiles.videos, mediaItem];
        setMediaFiles(prev => ({ ...prev, videos: updatedVideos }));
        localStorage.setItem("lectureVideos", JSON.stringify(updatedVideos));
      } else if (file.type.includes("audio")) {
        const updatedAudios = [...mediaFiles.audios, mediaItem];
        setMediaFiles(prev => ({ ...prev, audios: updatedAudios }));
        localStorage.setItem("lectureAudios", JSON.stringify(updatedAudios));
      }
      
      setIsUploading(false);
    }, 1000); // Simulate processing time
  };

  const startVideoRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      previewRef.current.srcObject = mediaStream;

      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      recordedChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks.current, { type: "video/webm" });
        saveMedia(videoBlob, 'video');
        setStream(null);
      };

      recorder.start();
      setRecording(prev => ({ ...prev, video: true }));
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Failed to access camera or microphone. Please check your permissions.");
    }
  };

  const startAudioRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      if (audioRef.current) {
        audioRef.current.srcObject = mediaStream;
      }

      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      recordedChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { type: "audio/webm" });
        saveMedia(audioBlob, 'audio');
        setStream(null);
      };

      recorder.start();
      setRecording(prev => ({ ...prev, audio: true }));
    } catch (err) {
      console.error("Error accessing audio devices:", err);
      alert("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setRecording({ video: false, audio: false });
    }
  };

  const deleteMedia = (index, type) => {
    if (type === 'video') {
      const updatedVideos = [...mediaFiles.videos];
      updatedVideos.splice(index, 1);
      setMediaFiles(prev => ({ ...prev, videos: updatedVideos }));
      localStorage.setItem("lectureVideos", JSON.stringify(updatedVideos));
    } else if (type === 'audio') {
      const updatedAudios = [...mediaFiles.audios];
      updatedAudios.splice(index, 1);
      setMediaFiles(prev => ({ ...prev, audios: updatedAudios }));
      localStorage.setItem("lectureAudios", JSON.stringify(updatedAudios));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const isRecording = recording.video || recording.audio;
  
  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <div className="container mx-auto py-8">
        <div className="bg-brand-card rounded-lg shadow-lg p-6 animate-fade-in">
          <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-primary text-transparent bg-clip-text">
            Lecture Media Manager
          </h1>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "videos"
                  ? "text-brand-purple border-b-2 border-brand-purple"
                  : "text-brand-textSecondary hover:text-brand-purple"
              }`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "audios"
                  ? "text-brand-purple border-b-2 border-brand-purple"
                  : "text-brand-textSecondary hover:text-brand-purple"
              }`}
              onClick={() => setActiveTab("audios")}
            >
              Audio
            </button>
          </div>
          
          {/* Recording options */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <input
                  type="text"
                  placeholder="Recording name (optional)"
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                  disabled={isRecording}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
                
                {activeTab === "videos" && (
                  <div className="flex md:flex-row flex-col gap-2">
                    {!recording.video ? (
                      <button
                        onClick={startVideoRecording}
                        disabled={isRecording}
                        className="px-4 py-2 bg-gradient-primary text-white rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M23 7l-7 5 7 5V7z"></path>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        Start Video Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                        </svg>
                        Stop Recording ({formatTime(recordingDuration)})
                      </button>
                    )}
                    
                    <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        disabled={isRecording || isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                
                {activeTab === "audios" && (
                  <div className="flex md:flex-row flex-col gap-2">
                    {!recording.audio ? (
                      <button
                        onClick={startAudioRecording}
                        disabled={isRecording}
                        className="px-4 py-2 bg-gradient-primary text-white rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                        Start Audio Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                        </svg>
                        Stop Recording ({formatTime(recordingDuration)})
                      </button>
                    )}
                    
                    <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload Audio
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        disabled={isRecording || isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-brand-purple h-2.5 rounded-full animate-pulse w-full"></div>
                </div>
              )}
            </div>
            
            {/* Preview area */}
            {recording.video && (
              <div className="mt-4">
                <p className="text-sm text-brand-textSecondary mb-2">Live Preview:</p>
                <video 
                  ref={previewRef} 
                  autoPlay 
                  muted 
                  className="w-full max-w-md h-64 bg-black rounded-md mx-auto object-cover" 
                />
              </div>
            )}
            
            {recording.audio && (
              <div className="mt-4 flex items-center justify-center">
                <div className="p-4 bg-brand-purple bg-opacity-10 rounded-full animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-brand-purple">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </div>
                <audio ref={audioRef} className="hidden" />
              </div>
            )}
          </div>
          
          {/* Media Library */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {activeTab === "videos" ? "Video Library" : "Audio Library"}
            </h2>
            
            {activeTab === "videos" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.videos.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-brand-textSecondary">
                    No videos available. Record or upload your first video!
                  </div>
                ) : (
                  mediaFiles.videos.map((video, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <video className="w-full h-40 object-cover bg-black">
                        <source src={video.url} type={video.type} />
                        Your browser does not support the video tag.
                      </video>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-brand-text truncate" title={video.name}>
                            {video.name}
                          </h3>
                          <button
                            onClick={() => deleteMedia(index, 'video')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        <div className="flex justify-between text-xs text-brand-textSecondary">
                          <span>{new Date(video.date).toLocaleDateString()}</span>
                          <span>{formatFileSize(video.size)}</span>
                        </div>
                        <div className="mt-3">
                          <video controls className="w-full rounded border border-gray-200">
                            <source src={video.url} type={video.type} />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === "audios" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaFiles.audios.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-brand-textSecondary">
                    No audio recordings available. Record or upload your first audio!
                  </div>
                ) : (
                  mediaFiles.audios.map((audio, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-purple bg-opacity-10 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-brand-purple">
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                              <line x1="12" y1="19" x2="12" y2="23"></line>
                              <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                          </div>
                          <h3 className="font-medium text-brand-text truncate" title={audio.name}>
                            {audio.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => deleteMedia(index, 'audio')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-brand-textSecondary mb-3">
                        <span>{new Date(audio.date).toLocaleDateString()}</span>
                        <span>{formatFileSize(audio.size)}</span>
                      </div>
                      <audio controls className="w-full">
                        <source src={audio.url} type={audio.type} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureVideoManager;