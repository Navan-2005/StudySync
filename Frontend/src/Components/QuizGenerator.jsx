// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';


// const QuizGenerator = ({ isLoggedIn }) => {
//   const [topic, setTopic] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!topic.trim()) {
//       setError('Please enter a topic');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError('');
      
//       const response = await axios.post('http://localhost:3000/ai/generate-quiz', { topic });
//       console.log('Quiz Generated : ',response.data);
      
//       if (response.data && response.data.quizId) {
//         // Pass quizData as state to QuizTaker
//         navigate(/quiz/${response.data.quizId}, { state: response.data });
//       } else {
//         setError('Failed to generate quiz. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error generating quiz:', error);
//       setError('Failed to generate quiz. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="quiz-generator">
//       <h1>Generate a Quiz</h1>
//       {!isLoggedIn && (
//         <div className="login-notice">
//           <p>Note: You can generate and take quizzes without logging in, but your results won't be saved to the leaderboard.</p>
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="topic">Enter a Topic:</label>
//           <input
//             type="text"
//             id="topic"
//             placeholder="e.g., JavaScript Basics, World History, Solar System"
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//             disabled={loading}
//           />
//         </div>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <button type="submit" className="generate-btn" disabled={loading}>
//           {loading ? 'Generating...' : 'Generate Quiz'}
//         </button>
//       </form>
      
//       <div className="topic-suggestions">
//         <h3>Popular Topics</h3>
//         <div className="topic-buttons">
//           {['JavaScript', 'World History', 'Science', 'Mathematics', 'Geography'].map((suggestedTopic) => (
//             <button
//               key={suggestedTopic}
//               onClick={() => setTopic(suggestedTopic)}
//               className="topic-btn"
//               disabled={loading}
//             >
//               {suggestedTopic}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuizGenerator;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const QuizGenerator = ({ isLoggedIn }) => {
  const {user}=useSelector((state)=>state.user);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state && location.state.roomId;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/ai/generate-quiz`, { topic,userId:user._id ,roomId:roomId});
      console.log('Quiz Generated : ',response.data);
      
      if (response.data && response.data.newquizId
      ) {
        // Pass quizData as state to QuizTaker
        console.log('RoomId in quiz generator : ',roomId);
        
        navigate(`/quiz/${response.data.newquizId
        }`, { 
          state: {
            ...response.data,
            quizId: response.data.newquizId, 
            roomId: roomId
          }
        });}
         else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div className="quiz-generator max-w-2xl mx-auto p-6 bg-brand-card rounded-lg shadow-lg border border-border animate-fade-in">
      <h1 className="text-3xl font-bold text-center bg-gradient-primary text-transparent bg-clip-text mb-6">Generate a Quiz</h1>
      
      {!isLoggedIn && (
        <div className="login-notice bg-background border-l-4 border-brand-teal p-4 mb-6 rounded">
          <p className="text-brand-textSecondary text-sm">Note: You can generate and take quizzes without logging in, but your results won't be saved to the leaderboard.</p>
        </div>
      )}
      
      {roomId && (
        <div className="room-id-container mb-6 p-3 bg-background rounded-lg border border-input">
          <label className="block text-brand-text font-medium mb-2">Room ID:</label>
          <div className="flex items-center">
            <input 
              type="text" 
              value={roomId} 
              readOnly 
              className="flex-grow px-3 py-2 bg-accent text-brand-text rounded-l-md border-r-0 border border-input focus:outline-none"
            />
            <button 
              onClick={copyToClipboard} 
              className="px-4 py-2 bg-gradient-primary hover:opacity-90 text-white rounded-r-md transition duration-300"
            >
              {copySuccess || 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-brand-textSecondary">Share this Room ID with friends to join the same quiz session</p>
        </div>
      )}
      
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
      
      <div className="topic-suggestions">
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
      </div>
    </div>
  );
};

export default QuizGenerator;