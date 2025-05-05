

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const QuizTaker = ({ onQuizComplete }) => {
  const location = useLocation();
  const quizData = location.state;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [submitting, setSubmitting] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);
  
  // Initialize answers array
  useEffect(() => {
    if (quizData && quizData.questions) {
      setUserAnswers(new Array(quizData.questions.length).fill(''));
    }
  }, [quizData]);
  
  // Timer effect
  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    
    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle option selection
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
  const handleSubmit = async () => {
    if (submitting) return;
    setIsTimerActive(false);
    setSubmitting(true);
    
    try {
      const userId = '6815c532759a26ff95250ef9';

      const response = await axios.post('http://localhost:3000/ai/submit-quiz', {
        quizId: quizData.quizId,
        topic: quizData.topic,
        userAnswers: userAnswers,
        correctAnswers: quizData.answers,
        userId: userId
      });
      
      if(response.status === 200) {
        console.log('Score:', response.data.score);
        setSubmitting(false);
        if (onQuizComplete) {
          onQuizComplete(response.data);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
      setIsTimerActive(true);
    }
  };
  
  // Check if we have data
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-brand-text mb-4">No quiz data available</h3>
          <p className="text-brand-textSecondary">Please try selecting a quiz from the dashboard.</p>
        </div>
      </div>
    );
  }
  
  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const timePercentage = (timeLeft / 300) * 100;
  
  return (
    <div className="animate-fade-in max-w-3xl mx-auto my-8">
      <div className="bg-gradient-primary p-1 rounded-xl shadow-lg">
        <div className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-text bg-clip-text text-transparent bg-gradient-primary">
              {quizData.topic} <span className="text-brand-text">Quiz</span>
            </h2>
            
            <div className={`px-4 py-2 rounded-full ${
              timeLeft < 60 ? 'bg-destructive text-white animate-pulse-light' : 'bg-brand-background border border-brand-purple'
            }`}>
              <span className={`font-medium ${timeLeft < 60 ? 'text-white' : 'text-brand-purple'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-brand-textSecondary">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
              <span className="font-medium text-brand-purple">{Math.round(progress)}% Complete</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-brand-text">{currentQ.question}</h3>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                // Extract option letter (A, B, C, D)
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = userAnswers[currentQuestion] === optionLetter;
                
                return (
                  <div 
                    key={index}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 flex items-center hover:shadow-md ${
                      isSelected 
                        ? 'bg-brand-purple bg-opacity-10 border-brand-purple' 
                        : 'hover:bg-brand-background border-gray-200'
                    }`}
                    onClick={() => handleSelectOption(index)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      isSelected 
                        ? 'bg-brand-purple text-white' 
                        : 'bg-gray-100 text-brand-textSecondary'
                    }`}>
                      {optionLetter}
                    </div>
                    <span className={`${isSelected ? 'text-brand-purple font-medium' : 'text-brand-text'}`}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                currentQuestion === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-background hover:bg-gray-200 text-brand-text'
              }`}
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    index === currentQuestion 
                      ? 'bg-brand-purple scale-125' 
                      : userAnswers[index] 
                        ? 'bg-brand-success' 
                        : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                  aria-label={`Go to question ${index + 1}`}
                />
              ))}
            </div>
            
            {currentQuestion < quizData.questions.length - 1 ? (
              <button 
                onClick={handleNext}
                className="px-5 py-2.5 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  submitting 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-primary text-white hover:opacity-90'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
          
          {/* Question Navigation Pills - Mobile */}
          <div className="md:hidden mt-6 flex flex-wrap gap-2 justify-center">
            {quizData.questions.map((_, index) => {
              const status = index === currentQuestion 
                ? 'current' 
                : userAnswers[index] 
                  ? 'answered' 
                  : 'unanswered';
                  
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    status === 'current' 
                      ? 'bg-brand-purple text-white' 
                      : status === 'answered' 
                        ? 'bg-brand-success text-white' 
                        : 'bg-gray-200 text-brand-textSecondary'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;