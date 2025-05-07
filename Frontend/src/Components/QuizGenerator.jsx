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
//         navigate(`/quiz/${response.data.quizId}`, { state: response.data });
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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuizGenerator = ({ isLoggedIn }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        navigate(`/quiz/${response.data.quizId}`, { state: response.data });
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
    <div className="quiz-generator max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Generate a Quiz</h1>
      
      {!isLoggedIn && (
        <div className="login-notice bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-sm text-blue-700">Note: You can generate and take quizzes without logging in, but your results won't be saved to the leaderboard.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="form-group mb-4">
          <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">Enter a Topic:</label>
          <input
            type="text"
            id="topic"
            placeholder="e.g., JavaScript Basics, World History, Solar System"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
        </div>
        
        {error && <div className="error-message bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded text-sm text-red-700">{error}</div>}
        
        <button 
          type="submit" 
          className="generate-btn w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-indigo-400" 
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>
      
      <div className="topic-suggestions">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Popular Topics</h3>
        <div className="topic-buttons flex flex-wrap gap-2">
          {['JavaScript', 'World History', 'Science', 'Mathematics', 'Geography'].map((suggestedTopic) => (
            <button
              key={suggestedTopic}
              onClick={() => setTopic(suggestedTopic)}
              className="topic-btn px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition duration-300 disabled:opacity-50"
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