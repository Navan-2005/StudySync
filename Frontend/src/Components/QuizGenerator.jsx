import React, { useState } from 'react';

// Mock version for preview purposes
const QuizGenerator = ({ isLoggedIn = false }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mocked submission handler for the preview
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    setLoading(true);
    // Simulate API call for preview
    setTimeout(() => {
      setLoading(false);
      console.log(`Would generate quiz on: ${topic}`);
      // In the real component, this would navigate to the quiz page
    }, 2000);
  };

  const popularTopics = ['JavaScript', 'World History', 'Science', 'Mathematics', 'Geography'];

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">Generate a Quiz</h1>
        <p className="text-gray-600">Create custom quizzes on any topic you want to learn or test yourself on</p>
      </div>
      
      {!isLoggedIn && (
        <div className="w-full p-4 mb-6 bg-orange-100 border border-orange-200 rounded-md">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Note:</span> You can generate and take quizzes without logging in, but your results won't be saved to the leaderboard.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            Enter a Topic:
          </label>
          <div className="relative">
            <input
              type="text"
              id="topic"
              placeholder="e.g., JavaScript Basics, World History, Solar System"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {topic && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear input"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full p-3 rounded-md font-medium text-white bg-gradient-to-r from-purple-600 to-teal-400 hover:opacity-90"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </div>
          ) : (
            'Generate Quiz'
          )}
        </button>
      </form>
      
      <div className="w-full mt-10">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Popular Topics</h3>
        <div className="flex flex-wrap gap-2">
          {popularTopics.map((suggestedTopic) => (
            <button
              key={suggestedTopic}
              onClick={() => setTopic(suggestedTopic)}
              className={`px-4 py-2 rounded-full text-sm ${
                topic === suggestedTopic
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              disabled={loading}
            >
              {suggestedTopic}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-12 w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center text-gray-600 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Our AI will generate 10 questions based on your chosen topic. The quiz will include a variety of question types.</p>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;