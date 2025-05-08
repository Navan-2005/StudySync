import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Mic, MicOff, MessageSquare, MinusCircle, Volume2, VolumeX } from "lucide-react";

export default function ChatbotComp() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. Ask me any questions during your call.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate a random ID for messages
  const generateId = () => Math.random().toString(36).substring(2, 10);

  const handleSendMessage = async (content) => {
    const messageContent = content || inputValue;
    if (messageContent.trim() === "") return;
    
    // Add user message
    const userMessage = {
      id: generateId(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Prepare chat history for the API
      const chatHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        }));
      
      // Make API call to your backend
      // Replace the URL with your actual backend endpoint
      const response = await fetch('http://localhost:3000/ai/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageContent,
          history: chatHistory
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response content based on your API structure
      // Adjust this based on your actual API response format
      let aiResponseContent;
      if (data && data.chat) {
        if (typeof data.chat === 'string') {
          aiResponseContent = data.chat;
        } else if (data.chat.text || data.chat.content || data.chat.message) {
          aiResponseContent = data.chat.text || data.chat.content || data.chat.message;
        } else {
          aiResponseContent = "I received a response I couldn't properly format.";
        }
      } else {
        aiResponseContent = "Sorry, I couldn't generate a response right now.";
      }
      
      // Add AI response
      const aiResponse = {
        id: generateId(),
        content: aiResponseContent,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      
      // If voice is enabled, read the response
      if (voiceEnabled) {
        speakText(aiResponse.content);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage = {
        id: generateId(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech synthesis not supported");
      return;
    }
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const speech = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = voices.filter(voice => 
      voice.name.includes('female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Google') ||
      voice.name.includes('Natural')
    );
    
    if (preferredVoices.length > 0) {
      speech.voice = preferredVoices[0];
    }
    
    speech.pitch = 1;
    speech.rate = 1;
    
    speech.onend = () => {
      // When AI finishes speaking in talk mode, start listening again
      if (isListening) {
        startListening();
      }
    };
    
    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(transcript);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  };

  const toggleMicrophone = () => {
    if (!isListening) {
      // Turn on voice responses when activating talk mode
      setVoiceEnabled(true);
      startListening();
    } else {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  };

  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      // If turning off voice, cancel any ongoing speech
      window.speechSynthesis.cancel();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 z-50"
        title="Open Chatbot"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <MessageSquare size={18} className="mr-2" />
          Quick Assistant
        </h3>
        <div className="flex gap-2">
          <button
            onClick={toggleVoiceOutput}
            className="text-white hover:text-gray-200"
            title={voiceEnabled ? "Voice Output On" : "Voice Output Off"}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200"
            title="Minimize"
          >
            <MinusCircle size={18} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-3 overflow-auto bg-gray-50">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-2 ${
                  message.isUser 
                    ? 'bg-indigo-100 text-gray-800' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          {isListening && (
            <div className="flex justify-center my-1">
              <div className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs flex items-center gap-1">
                <div className="flex gap-1 items-end">
                  <div className="w-1 h-2 bg-indigo-600 animate-pulse" style={{ animationDuration: "0.8s" }}></div>
                  <div className="w-1 h-3 bg-indigo-600 animate-pulse" style={{ animationDuration: "0.7s", animationDelay: "0.1s" }}></div>
                  <div className="w-1 h-4 bg-indigo-600 animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.2s" }}></div>
                  <div className="w-1 h-2 bg-indigo-600 animate-pulse" style={{ animationDuration: "0.7s", animationDelay: "0.3s" }}></div>
                  <div className="w-1 h-3 bg-indigo-600 animate-pulse" style={{ animationDuration: "0.8s", animationDelay: "0.4s" }}></div>
                </div>
                <span>Listening...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type your question..."}
            className={`w-full py-2 px-3 pr-16 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
              isListening ? 'border-indigo-500 bg-indigo-50' : ''
            }`}
            disabled={isListening}
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button 
              className={`p-1.5 rounded-full ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={toggleMicrophone}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button 
              className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSendMessage()}
              disabled={inputValue.trim() === "" || isLoading}
            >
              <SendHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}