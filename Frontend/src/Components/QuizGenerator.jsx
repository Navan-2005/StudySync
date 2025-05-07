import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';


const QuizGenerator = ({ isLoggedIn }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      
      const response = await axios.post('http://localhost:3000/ai/generate-quiz', { topic });
      console.log('Quiz Generated : ',response.data);
      
      if (response.data && response.data.quizId) {
        // Pass quizData as state to QuizTaker
        navigate(`/quiz/${response.data.quizId}`, { state: response.data,quizId: response.data.quizId, roomId: roomId });
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-generator">
      <h1>Generate a Quiz</h1>
      {!isLoggedIn && (
        <div className="login-notice">
          <p>Note: You can generate and take quizzes without logging in, but your results won't be saved to the leaderboard.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="topic">Enter a Topic:</label>
          <input
            type="text"
            id="topic"
            placeholder="e.g., JavaScript Basics, World History, Solar System"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>
      
      <div className="topic-suggestions">
        <h3>Popular Topics</h3>
        <div className="topic-buttons">
          {['JavaScript', 'World History', 'Science', 'Mathematics', 'Geography'].map((suggestedTopic) => (
            <button
              key={suggestedTopic}
              onClick={() => setTopic(suggestedTopic)}
              className="topic-btn"
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
