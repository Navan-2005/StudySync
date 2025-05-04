
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import quiz from '../../../Backend/services/quiz';
import axios from 'axios';
import mongoose from 'mongoose';

const QuizTaker = ({ onQuizComplete }) => {
  // Mock quiz data for demonstration
  const location = useLocation();
  const quizData = location.state;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize answers array
  useEffect(() => {
    if (quizData && quizData.questions) {
      setUserAnswers(new Array(quizData.questions.length).fill(''));
    }
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle option selection - Fixed function
  const handleSelectOption = (optionIndex) => {
    const selectedAnswer = String.fromCharCode(65 + optionIndex); // Convert 0,1,2,3 to A,B,C,D
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newAnswers);
  };
  
  // Handle navigation
  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Handle quiz submission
  const handleSubmit =async () => {
    if (submitting) return;
    console.log(userAnswers);
    
    setSubmitting(true);
    
    try {
        console.log('quiz id : ',quizData.quizId);
        console.log('user answers : ',userAnswers);
        console.log('correct answers : ',quizData.answers);
        const userId = '6815c532759a26ff95250ef9';

      // Mock the API call for demonstration
      const response=await axios.post('http://localhost:3000/ai/submit-quiz',
         {quizId: quizData.quizId,
          topic:quizData.topic,
          userAnswers: userAnswers,
          correctAnswers:quizData.answers,
          userId:userId});
      if(response.status === 200){
        console.log('Score : ',response.data.score);
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Check if we have data
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <div>No quiz data available.</div>;
  }
  
  const currentQ = quizData.questions[currentQuestion];
  
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{quizData.topic} Quiz</h2>
        <div className="text-md font-medium text-gray-600">Time remaining: {formatTime(timeLeft)}</div>
      </div>
      
      <div className="mb-4">
        <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {quizData.questions.length}</span>
        <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg text-amber-300 font-semibold mb-4">{currentQ.question}</h3>
        
        <div className="space-y-2">
          {currentQ.options.map((option, index) => {
            // Extract option letter (A, B, C, D)
            const optionLetter = String.fromCharCode(65 + index);
            
            return (
              <div 
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  userAnswers[currentQuestion] === optionLetter 
                    ? 'bg-blue-100 text-gray-900 border-blue-500' 
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
                onClick={() => handleSelectOption(index)}
              >
                {option}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded ${
            currentQuestion === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        
        {currentQuestion < quizData.questions.length - 1 ? (
          <button 
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 rounded ${
              submitting 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
      
      <div className="flex justify-center mt-6 space-x-2">
        {quizData.questions.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === currentQuestion 
                ? 'bg-blue-500' 
                : userAnswers[index] 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
            }`}
            onClick={() => setCurrentQuestion(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizTaker;