import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Copy, Trash, Volume2, VolumeX, Settings, Upload, Check, AlertCircle } from "lucide-react";
import axios from "axios";

export default function VoiceToTextComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [showTranscriber, setShowTranscriber] = useState(false);
  const [error, setError] = useState(null);
  const [realtimeText, setRealtimeText] = useState("");
  const [transcriptComplete, setTranscriptComplete] = useState(true);
  const [language, setLanguage] = useState('en-US');
  const [showSettings, setShowSettings] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000/audio');
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'
  const [autoUpload, setAutoUpload] = useState(false);
  const[data,setData] = useState(null);

  
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const fullTranscriptRef = useRef("");
  const recognitionActiveRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  // Available languages for transcription
  const availableLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ru-RU', name: 'Russian' }
  ];

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Your browser doesn't support speech recognition. Try Chrome or Edge.");
    }
    
    return () => {
      // Clean up on unmount
      cleanupResources();
    };
  }, []);
  
  // Clean up all resources
  const cleanupResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
  };
  
  // Audio visualization setup
  const setupAudioVisualization = (stream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      analyserRef.current.smoothingTimeConstant = 0.85;
    }
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!isRecording || !analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setAudioLevel(average / 255); // Normalize to 0-1 range
      
      if (isRecording) {
        requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  };
  
  // Start the speech recognition with improved accuracy
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return false;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 5; // Increased for better accuracy
    recognitionRef.current.lang = language;
    
    // Store complete transcript across recognition sessions
    recognitionActiveRef.current = true;
    
    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started");
    };
    
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      // Process results with improved accuracy
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Get the most accurate alternative
        // Sort by confidence if available
        const alternatives = Array.from({ length: event.results[i].length }, 
          (_, j) => ({ 
            transcript: event.results[i][j].transcript,
            confidence: event.results[i][j].confidence || 0
          })
        ).sort((a, b) => b.confidence - a.confidence);
        
        const bestTranscript = alternatives[0].transcript;
        
        if (event.results[i].isFinal) {
          // For final results, use proper grammar and punctuation
          let processedTranscript = bestTranscript;
          
          // Ensure first letter is capitalized
          if (processedTranscript.length > 0) {
            processedTranscript = processedTranscript.charAt(0).toUpperCase() + 
                                processedTranscript.slice(1);
          }
          
          // Add period if missing at the end
          if (processedTranscript.length > 0 && 
              !".!?".includes(processedTranscript.charAt(processedTranscript.length - 1))) {
            processedTranscript += ".";
          }
          
          finalTranscript += processedTranscript + ' ';
        } else {
          interimTranscript += bestTranscript;
        }
      }
      
      // Add final results to our complete transcript
      if (finalTranscript) {
        fullTranscriptRef.current += finalTranscript;
      }
      
      // Update the real-time text with both final and interim results
      setRealtimeText(fullTranscriptRef.current + interimTranscript);
    };
    
    recognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === 'network') {
          setError("Network error. Check your connection.");
        } else if (event.error === 'not-allowed') {
          setError("Microphone access denied. Check permissions.");
        } else if (event.error === 'aborted') {
          console.log("Recognition aborted");
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
      }
    };
    
    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      
      // Only try to restart if we haven't manually stopped
      if (recognitionActiveRef.current) {
        // Add a small delay before restarting to avoid rapid restarts
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (recognitionActiveRef.current) {
              console.log("Restarting speech recognition...");
              recognitionRef.current.start();
            }
          } catch (error) {
            console.error("Error restarting speech recognition:", error);
            recognitionActiveRef.current = false;
            setIsRecording(false);
          }
        }, 300);
      }
    };
    
    try {
      recognitionRef.current.start();
      return true;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setError("Failed to start speech recognition");
      return false;
    }
  };
  
  // Toggle recording on/off
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Toggle mute/unmute
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };
  
  // Start recording with voice recognition
  const startRecording = async () => {
    setError(null);
    setRealtimeText("");
    fullTranscriptRef.current = ""; // Reset full transcript reference
    setTranscriptComplete(false);
    recognitionActiveRef.current = true;
    
    try {
      // Request microphone access with high-quality audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16
        } 
      });
      streamRef.current = stream;
      
      // Setup audio visualization
      setupAudioVisualization(stream);
      
      // Start the speech recognition
      const recognitionStarted = startSpeechRecognition();
      if (recognitionStarted) {
        setIsRecording(true);
      } else {
        // If speech recognition fails, stop the stream too
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
    } catch (error) {
      setError("Could not access microphone. Please check permissions.");
      console.error("Microphone access error:", error);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (isRecording) {
      recognitionActiveRef.current = false;
      
      // Cancel any pending restart
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      
      // Final cleanup after short delay to ensure all transcriptions complete
      setTimeout(() => {
        // Stop audio tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.suspend().catch(console.error);
        }
        
        // Save the transcription
        saveTranscription();
        
        setIsRecording(false);
        setTranscriptComplete(true);
        setAudioLevel(0);
      }, 500);
    }
  };
  
  // Convert transcription to JSON and send to backend
  const sendToBackend = async (transcriptionData) => {
    setUploadStatus('uploading');
    
    try {
      // Create JSON payload
      const payload = {
        transcription: {
          id: transcriptionData.id,
          text: transcriptionData.text,
          rawText: transcriptionData.rawText,
          timestamp: transcriptionData.timestamp.toISOString(),
          language: language,
          metadata: {
            browser: navigator.userAgent,
            recordingDuration: Date.now() - new Date(transcriptionData.timestamp).getTime()
          }
        }
      };
      
      console.log("Sending to backend:", payload);
      
      // Send to backend
      // const response = await fetch(backendUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload)
      // });
      console.log("Sending to backend:", payload);
      
      const response=await axios.post(backendUrl, {text:payload.transcription.text},
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.data) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      localStorage.setItem('transcript',response.data)
      const data = await response.data;
      console.log("Backend response:", data);
      setData(data);
      setUploadStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
      
      return data;
    } catch (error) {
      console.error("Error sending to backend:", error);
      setUploadStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
      
      return null;
    }
  };
  
  // Save transcription
  const saveTranscription = () => {
    // Get the final transcription text
    const finalText = realtimeText || fullTranscriptRef.current || "No transcription available";
    
    if (finalText.trim()) {
      // Post-process the text for better readability
      let processedText = finalText;
      
      // Replace common speech recognition errors
      processedText = processedText
        .replace(/(\w)(\s+)(\.)(\s*)/g, '$1$3$4') // Fix spaces before periods
        .replace(/(\s+)(,)(\s*)/g, '$2$3')         // Fix spaces before commas
        .replace(/\s+/g, ' ')                      // Normalize spaces
        .trim();
      
      // Add new transcription to list with the processed text
      const newTranscription = {
        id: Date.now().toString(),
        timestamp: new Date(),
        text: processedText,
        rawText: finalText.trim(), // Keep original for reference
        uploaded: false
      };
      
      setTranscriptions(prev => {
        const updatedTranscriptions = [...prev, newTranscription];
        
        // Auto-upload if enabled
        if (autoUpload) {
          sendToBackend(newTranscription).then(result => {
            if (result) {
              // Mark as uploaded
              setTranscriptions(current => 
                current.map(item => 
                  item.id === newTranscription.id ? { ...item, uploaded: true } : item
                )
              );
            }
          });
        }
        
        return updatedTranscriptions;
      });
      
      console.log("Transcription saved:", processedText);
      return newTranscription;
    }
    return null;
  };
  
  // Copy transcription to clipboard
  const copyTranscription = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could show a temporary success message here
        console.log("Copied to clipboard");
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
      });
  };
  
  // Delete a transcription
  const deleteTranscription = (id) => {
    setTranscriptions(prev => prev.filter(item => item.id !== id));
  };
  
  // Manually upload a transcription to backend
  const uploadTranscription = (transcription) => {
    sendToBackend(transcription).then(result => {
      if (result) {
        // Mark as uploaded
        setTranscriptions(current => 
          current.map(item => 
            item.id === transcription.id ? { ...item, uploaded: true } : item
          )
        );
      }
    });
  };
  
  // Download all transcriptions as JSON
  const downloadTranscriptionsAsJson = () => {
    if (transcriptions.length === 0) return;
    
    const jsonData = {
      transcriptions: transcriptions.map(t => ({
        id: t.id,
        text: t.text,
        rawText: t.rawText,
        timestamp: t.timestamp.toISOString(),
        language: language
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        totalCount: transcriptions.length
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-transcriptions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Audio level indicator component
  const AudioLevelIndicator = () => {
    const level = audioLevel * 100; // Convert to percentage
    
    return (
      <div className="h-2 bg-gray-200 rounded-full w-full mt-2">
        <div 
          className={`h-full rounded-full ${
            level > 60 ? 'bg-green-500' : level > 30 ? 'bg-green-400' : 'bg-green-300'
          }`} 
          style={{ width: `${level}%` }}
        />
      </div>
    );
  };

  return (
    <div className="fixed bottom-24 right-24 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setShowTranscriber(!showTranscriber)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        title={showTranscriber ? "Hide Voice Transcriber" : "Show Voice Transcriber"}
      >
        <Mic size={24} />
      </button>
      
      {/* Transcriber panel */}
      {showTranscriber && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Enhanced Voice to Text</h3>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-blue-200"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
          
          {/* Settings panel */}
          {showSettings && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium mb-2">Language Settings</h4>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm mb-4"
                disabled={isRecording}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              
              <h4 className="text-sm font-medium mb-2">Backend Integration</h4>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="Backend API URL"
                className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                disabled={isRecording}
              />
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="auto-upload"
                  checked={autoUpload}
                  onChange={(e) => setAutoUpload(e.target.checked)}
                  className="mr-2"
                  disabled={isRecording}
                />
                <label htmlFor="auto-upload" className="text-sm">
                  Auto-upload transcriptions
                </label>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={downloadTranscriptionsAsJson}
                  disabled={transcriptions.length === 0}
                  className={`text-sm px-3 py-1 rounded ${
                    transcriptions.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Download All as JSON
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Selecting the right language improves transcription accuracy significantly.
              </p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-2 border-b border-red-100">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          
          {/* Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={toggleRecording}
                className={`p-4 rounded-full ${
                  isRecording 
                    ? 'bg-red-600 animate-pulse' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isRecording ? (
                  <MicOff size={24} className="text-white" />
                ) : (
                  <Mic size={24} className="text-gray-700" />
                )}
              </button>
              
              {isRecording && (
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full ${
                    isMuted 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX size={24} className="text-white" />
                  ) : (
                    <Volume2 size={24} className="text-gray-700" />
                  )}
                </button>
              )}
            </div>
            
            <div className="text-center text-sm font-medium">
              {isRecording ? (
                <span className="text-red-600">Listening...</span>
              ) : (
                <span>Tap to Start</span>
              )}
            </div>
            
            {/* Audio level indicator */}
            {isRecording && <AudioLevelIndicator />}
          </div>
          
          {/* Real-time transcription display */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Transcription:</h4>
              {isRecording && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full animate-pulse">
                  Listening...
                </span>
              )}
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 min-h-24 max-h-56 overflow-y-auto">
              {isRecording && realtimeText ? (
                <p className="text-sm whitespace-pre-wrap">{realtimeText}</p>
              ) : isRecording ? (
                <p className="text-sm text-gray-400 italic">Start speaking clearly...</p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  For best results:
                  <br />• Speak clearly at a normal pace
                  <br />• Use in a quiet environment
                  <br />• Position microphone close to mouth
                </p>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {isRecording ? (
                <span>Enunciate clearly and pauses between sentences improve accuracy</span>
              ) : (
                <span>Your speech will be converted to text with enhanced accuracy</span>
              )}
            </div>
          </div>
          
          {/* Status indicator for uploads */}
          {uploadStatus && (
            <div className={`p-2 text-center text-sm ${
              uploadStatus === 'uploading' ? 'bg-blue-50 text-blue-700' :
              uploadStatus === 'success' ? 'bg-green-50 text-green-700' :
              'bg-red-50 text-red-700'
            }`}>
              {uploadStatus === 'uploading' && 'Uploading to backend...'}
              {uploadStatus === 'success' && 'Successfully uploaded!'}
              {uploadStatus === 'error' && 'Error uploading to backend'}
            </div>
          )}
          
          {/* Saved transcriptions list */}
          {transcriptions.length > 0 && (
            <div className="max-h-64 overflow-y-auto p-2">
              <h4 className="text-sm font-medium px-2 py-1">Saved Transcriptions:</h4>
              
              <div className="space-y-2">
                {transcriptions.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 rounded p-2 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex gap-1">
                        {/* Copy button */}
                        <button 
                          onClick={() => copyTranscription(item.text)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Copy to Clipboard"
                        >
                          <Copy size={14} />
                        </button>
                        
                        {/* Upload button */}
                        {!item.uploaded && !autoUpload && (
                          <button 
                            onClick={() => uploadTranscription(item)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            title="Upload to Backend"
                          >
                            <Upload size={14} />
                          </button>
                        )}
                        
                        {/* Upload status indicator */}
                        {item.uploaded && (
                          <span className="text-green-600" title="Uploaded to Backend">
                            <Check size={14} />
                          </span>
                        )}
                        
                        {/* Delete button */}
                        <button 
                          onClick={() => deleteTranscription(item.id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Transcription text */}
                    <div className="mt-1 pt-1 border-t border-gray-200">
                      <p className="text-xs text-gray-700">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}