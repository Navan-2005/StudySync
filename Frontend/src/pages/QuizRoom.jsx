import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
const QuizRoom = ({ isLoggedIn }) => {
  const [topic, setTopic] = useState('');
  const {user} = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomAction, setRoomAction] = useState(''); // 'create' or 'join'
  
  const location = useLocation();
  const navigate = useNavigate();
  const locationRoomId = location.state && location.state.roomId;

  const handleRoomSelection = async (action) => {
    setRoomAction(action);
    
    if (action === 'create') {
      try {
        setLoading(true);
        // Create a new room
        const response=await axios.post('http://localhost:3000/rooms/create', { userId: user._id,username:user.username });
        console.log(response);
        
        if (response.data && response.data.roomId) {
          setRoomId(response.data.roomId);
          navigate('/quiz',{state:{roomId:response.data.roomId}});

          setShowTopicSelector(true);
        } else {
          setError('Failed to create quiz room. Please try again.');
        }
      } catch (error) {
        console.error('Error creating quiz room:', error);
        setError('Failed to create quiz room. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else if (action === 'join') {
      // For join action, we'll validate the room code when the user submits it
      setShowTopicSelector(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setLoading(true);
      // Validate room code
      const response = await axios.get(`http://localhost:3000/rooms/${roomCode}`);
      if (response.data && response.data.roomId) {
        setRoomId(roomCode);
        setShowTopicSelector(true);
      } else {
        setError('Invalid room code. Please try again.');
      }
    } catch (error) {
      console.error('Error joining quiz room:', error);
      setError('Room not found or no longer active.');
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (!topic.trim()) {
  //     setError('Please enter a topic');
  //     return;
  //   }
    
  //   try {
  //     setLoading(true);
  //     setError('');
      
  //     const response = await axios.post('http://localhost:3000/ai/generate-quiz', { 
  //       topic,
  //       roomId: roomId || locationRoomId // Use the new roomId or the one from location state
  //     });
      
  //     console.log('Quiz Generated : ', response.data);
      
  //     if (response.data && response.data.quizId) {
  //       // Pass quizData as state to QuizTaker
  //       console.log('RoomId in quiz generator : ', roomId || locationRoomId);
        
  //       navigate(`/quiz/${response.data.quizId}`, { 
  //         state: {
  //           ...response.data,
  //           quizId: response.data.quizId,
  //           roomId: roomId || locationRoomId
  //         }
  //       });
  //     } else {
  //       setError('Failed to generate quiz. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error generating quiz:', error);
  //     setError('Failed to generate quiz. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Show room selection if not already in a room and topic selector is not shown
  const showRoomSelection = !locationRoomId && !showTopicSelector;
  
  return (
    <div className="quiz-generator max-w-2xl mx-auto p-6 bg-brand-card rounded-lg shadow-lg border border-border animate-fade-in">
      <h1 className="text-3xl font-bold text-center bg-gradient-primary text-transparent bg-clip-text mb-6">
        {showRoomSelection ? 'Group Quiz' : 'Generate a Quiz'}
      </h1>
      
    
      
      {showRoomSelection && (
        <div className="room-selection mb-6">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleRoomSelection('create')}
              className="create-room-btn w-full bg-gradient-primary hover:opacity-90 text-white font-medium py-3 px-4 rounded-md transition duration-300 disabled:opacity-70"
              disabled={loading}
            >
              Create a Quiz Room
            </button>
            
            <div className="text-center text-brand-textSecondary">- OR -</div>
            
            <div className="join-room">
              <div className="flex flex-col mb-4">
                <label htmlFor="roomCode" className="block text-brand-text font-medium mb-2">Join with Room Code:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="roomCode"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-background"
                  />
                  <button 
                    onClick={handleJoinRoom}
                    className="join-btn bg-gradient-primary hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-70"
                    disabled={loading || !roomCode.trim()}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* {roomAction === 'create' && roomId && !loading && (
        <div className="room-info bg-background border-l-4 border-brand-teal p-4 mb-6 rounded">
          <p className="text-brand-textSecondary text-sm mb-1">Room created successfully!</p>
          <p className="text-brand-text font-medium">Room Code: <span className="font-bold">{roomId}</span></p>
          <p className="text-brand-textSecondary text-sm mt-2">Share this code with others to join your quiz room.</p>
        </div>
      )} */}
      
      {/* {(showTopicSelector || locationRoomId) && (
        <>
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="form-group mb-4">
              <label htmlFor="topic" className="block text-brand-text font-medium mb-2">Enter a Topic:</label>
              <input
                type="text"
                id="topic"
                placeholder="e.g., JavaScript Basics, World History, Solar System"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-background"
              />
            </div>
            
            {error && (
              <div className="error-message bg-background border-l-4 border-brand-alert p-3 mb-4 rounded text-sm text-brand-textSecondary">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="generate-btn w-full bg-gradient-primary hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-70" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </form>
          
          {/* <div className="topic-suggestions">
            <h3 className="text-lg font-medium text-brand-text mb-3">Popular Topics</h3>
            <div className="topic-buttons flex flex-wrap gap-2">
              {['JavaScript', 'World History', 'Science', 'Mathematics', 'Geography'].map((suggestedTopic) => (
                <button
                  key={suggestedTopic}
                  onClick={() => setTopic(suggestedTopic)}
                  className="topic-btn px-3 py-1 bg-background hover:bg-accent text-brand-textSecondary rounded-full text-sm font-medium transition duration-300 disabled:opacity-50 hover:animate-pulse-light"
                  disabled={loading}
                >
                  {suggestedTopic}
                </button>
              ))}
            </div>
          </div> */}
        {/* </>
      )} */} 
{/*       
      {loading && (
        <div className="flex justify-center my-6">
          <div className="loader">
            <svg className="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default QuizRoom;