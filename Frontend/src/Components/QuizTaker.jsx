import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const QuizTaker = ({ onQuizComplete }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const roomId = location.state?.roomId;
  const quizId = location.state?.quizId;

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [submitting, setSubmitting] = useState(false);
  const [topic, setTopic] = useState('');
  const [answers, setAnswers] = useState([]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('quizId : ', quizId);
        const response = await axios.post('http://localhost:3000/ai/quizzes', { quizId });
        if (!response.data.questions) {
          console.log('No questions');
          return;
        }
        console.log('Response from quiz : ', response.data);
        console.log('Questions from ai :',response.data.questions);
        setTopic(response.data.topic);
        setQuestions(response.data.questions);
        setAnswers(response.data.correctAnswers);
        setUserAnswers(new Array(response.data.questions.length).fill(''));
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions]);

  // Scroll to top on question change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestion]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    const selectedAnswer = String.fromCharCode(65 + optionIndex);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      console.log('quizId:', quizId);
      console.log('topic:', topic);
      console.log('userAnswers:', userAnswers);
      console.log('answers:', answers);
      console.log('userId : ', user._id);
      
      
      const userId = user._id;
      
      const response = await axios.post('http://localhost:3000/ai/submit-quiz', {
        quizId,
        topic,
        userAnswers,
        correctAnswers: answers,
        userId,
      });

      if (response.status === 200) {
        const { score, percentage } = response.data;
         console.log('Room Id : ', roomId);
         
        const result = await axios.post('http://localhost:3000/rooms/submit', {
          roomId,
          userId,
          score,
          percentage,
        });

        if (result.status === 200) {
          console.log('Result submitted:', result.data);
          if (onQuizComplete) onQuizComplete(); // Notify parent if needed
        }
      }

      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (!quizId) return <div>Invalid quiz ID.</div>;
  if (!questions.length) return <div>Loading quiz questions...</div>;

  const currentQ = questions[currentQuestion];

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{topic} Quiz</h2>
        <div className="text-md font-medium text-gray-600">Time remaining: {formatTime(timeLeft)}</div>
      </div>

      <div className="mb-4">
        <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
        <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg text-amber-300 font-semibold mb-4">{currentQ.question}</h3>
        <div className="space-y-2">
          {currentQ.options.map((option, index) => {
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

        {currentQuestion < questions.length - 1 ? (
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
        {questions.map((_, index) => (
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
