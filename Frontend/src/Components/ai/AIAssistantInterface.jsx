import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Mic, MicOff, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Helper to load messages from sessionStorage instead of localStorage
const loadMessages = () => {
  try {
    const storedMessages = sessionStorage.getItem("ai-assistant-chat-history");
    if (storedMessages) {
      // Parse stored messages and convert string timestamps back to Date objects
      return JSON.parse(storedMessages).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
  
  // Return an empty array as default
  // No welcome message to avoid Google AI API issues with first message role
  return [];
};

export function AIAssistantInterface() {
  // Load messages from sessionStorage on initial render
  const [messages, setMessages] = useState(loadMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceState, setVoiceState] = useState("idle");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { toast } = useToast();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem("ai-assistant-chat-history", JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [messages]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
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
    setVoiceState("thinking");
    
    try {
      // Filter out the welcome message if it's the first message and prepare history
      const chatHistory = messages
        .filter((msg, index) => !(index === 0 && msg.id === "welcome"))
        .map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        }));
      
      // Make API call to backend
      const response = await axios.post('http://localhost:3000/ai/chatbot', {
        prompt: messageContent,
        history: chatHistory
      });
      
      // Process the API response based on your controller format
      let aiResponseContent;
      
      // Check if response has the chat property as shown in the controller
      if (response.data && response.data.chat) {
        if (typeof response.data.chat === 'string') {
          aiResponseContent = response.data.chat;
        } else if (typeof response.data.chat === 'object') {
          // Try to extract text from common response formats
          if (response.data.chat.text) {
            aiResponseContent = response.data.chat.text;
          } else if (response.data.chat.content) {
            aiResponseContent = response.data.chat.content;
          } else if (response.data.chat.message) {
            aiResponseContent = response.data.chat.message;
          } else {
            // Safely stringify the object if no recognizable property is found
            try {
              aiResponseContent = JSON.stringify(response.data.chat);
            } catch (e) {
              aiResponseContent = "Received a response I couldn't display properly.";
            }
          }
        } else {
          // Fallback if chat is neither string nor object
          aiResponseContent = "Received a response in an unexpected format.";
        }
      } else {
        // Fallback if response doesn't contain chat property
        aiResponseContent = "I'm sorry, I couldn't process that request.";
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
        setVoiceState("speaking");
        speakText(aiResponse.content);
      } else {
        setVoiceState("idle");
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
      setVoiceState("idle");
      
      toast({
        title: "Error",
        description: "Failed to get response from the server.",
        variant: "destructive"
      });
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
      toast({
        title: "Speech synthesis not supported",
        description: "Your browser doesn't support speech synthesis.",
        variant: "destructive"
      });
      setVoiceState("idle");
      return;
    }
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const speech = new SpeechSynthesisUtterance(text);
    
    speech.onend = () => {
      setVoiceState("idle");
      // When AI finishes speaking in talk mode, start listening again
      if (isListening) {
        startListening();
      }
    };
    
    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setVoiceState("listening");
    };
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(transcript);
    };
    
    recognitionRef.current.onend = () => {
      // Don't reset listening state here as we want to maintain the "conversation" mode
      if (voiceState !== "thinking" && voiceState !== "speaking" && isListening) {
        // Only restart if we're not already processing or speaking
        recognitionRef.current?.start();
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'no-speech') {
        // If no speech detected, just restart listening
        if (isListening) {
          recognitionRef.current?.start();
        }
      } else {
        toast({
          title: "Speech recognition error",
          description: `Error: ${event.error}. Try again or type your question.`,
          variant: "destructive"
        });
        setIsListening(false);
        setVoiceState("idle");
      }
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
      setVoiceState("idle");
    }
  };

  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      // If turning off voice, cancel any ongoing speech
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  };

  const suggestedQuestions = [
    "Explain the law of conservation of energy",
    "What are the key differences between DNA and RNA?",
    "Can you give me 5 MCQs on Newton's laws?",
    "Help me understand photosynthesis"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Ask Zone</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the chat history?")) {
                // Start with an empty array instead of the welcome message to avoid API issues
                setMessages([]);
                sessionStorage.removeItem("ai-assistant-chat-history");
              }
            }}
            className="flex items-center gap-1"
          >
            <Trash2 size={16} />
            <span className="text-sm">Clear</span>
          </Button>
          <Button 
            variant={voiceEnabled ? "default" : "outline"} 
            size="sm" 
            onClick={toggleVoiceOutput}
            className={`${voiceEnabled ? 'bg-gradient-primary' : ''} flex items-center gap-1`}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="text-sm">{voiceEnabled ? "Voice On" : "Voice Off"}</span>
          </Button>
        </div>
      </div>

      <Card className="flex-1 mb-4 bg-white/70 backdrop-blur-sm border border-gray-100 shadow-md">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {/* Display welcome message only if there are no messages yet */}
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-xl p-3 bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white text-xs">AI</span>
                    </div>
                    <span className="text-xs text-brand-textSecondary">Assistant</span>
                  </div>
                  <p>Hello! I'm your AI study assistant. How can I help you today?</p>
                  <div className="text-right mt-1">
                    <span className="text-xs text-brand-textSecondary">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-xl p-3 ${
                    message.isUser 
                      ? 'bg-brand-purple/20 text-brand-text ml-auto' 
                      : 'bg-white border border-gray-100 shadow-sm'
                  }`}
                >
                  {message.isUser ? (
                    <div className="flex items-start mb-1">
                      <span className="text-xs text-brand-textSecondary">You</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-white text-xs">AI</span>
                      </div>
                      <span className="text-xs text-brand-textSecondary">Assistant</span>
                    </div>
                  )}
                  <p>{typeof message.content === 'object' ? JSON.stringify(message.content) : message.content}</p>
                  <div className="text-right mt-1">
                    <span className="text-xs text-brand-textSecondary">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Voice State Indicator */}
            {voiceState === "listening" && (
              <div className="flex justify-center my-2">
                <div className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-brand-purple animate-pulse" style={{ animationDuration: "0.8s" }}></div>
                    <div className="w-1 h-6 bg-brand-purple animate-pulse" style={{ animationDuration: "0.7s", animationDelay: "0.1s" }}></div>
                    <div className="w-1 h-8 bg-brand-purple animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-4 bg-brand-purple animate-pulse" style={{ animationDuration: "0.7s", animationDelay: "0.3s" }}></div>
                    <div className="w-1 h-6 bg-brand-purple animate-pulse" style={{ animationDuration: "0.8s", animationDelay: "0.4s" }}></div>
                  </div>
                  <span>Listening...</span>
                </div>
              </div>
            )}
            
            {voiceState === "speaking" && (
              <div className="flex justify-center my-2">
                <div className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-sm flex items-center gap-2">
                  <Volume2 size={14} className="animate-pulse" />
                  <span>Speaking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>
      
      <div className="mb-4">
        <div className="flex gap-2 flex-wrap">
          {suggestedQuestions.map((question, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              onClick={() => setInputValue(question)}
              className="bg-white/50 text-sm"
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... speak now" : "Ask your question here..."}
          className={`pr-24 bg-white/90 backdrop-blur-sm shadow-sm ${isListening ? 'border-brand-purple' : ''}`}
          disabled={isListening}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          <Button 
            size="sm"
            variant={isListening ? "default" : "outline"}
            className={`rounded-full p-2 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse border-red-500' 
                : voiceState === "speaking" 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
            }`}
            onClick={toggleMicrophone}
            disabled={voiceState === "speaking"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          <Button 
            size="sm"
            onClick={() => handleSendMessage()}
            className="rounded-full p-2 bg-gradient-primary"
            disabled={inputValue.trim() === "" || isListening}
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </div>
      
      {isListening && (
        <div className="text-center mt-2 text-xs text-brand-textSecondary">
          <p>Tap mic again to end conversation</p>
        </div>
      )}
    </div>
  );
}