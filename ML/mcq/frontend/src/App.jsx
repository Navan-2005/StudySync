import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  
  // Test taking state variables
  const [testMode, setTestMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Timer variables
  const [testTime, setTestTime] = useState(5); // Time in minutes
  const [timeRemaining, setTimeRemaining] = useState(0); // Time in seconds
  const [timerActive, setTimerActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const submitTest = useCallback(() => {
    // Stop timer if it's running
    setTimerActive(false);
    
    // Calculate score
    let correctCount = 0;
    mcqs.forEach((mcq, index) => {
      if (userAnswers[index] === mcq.correctAnswer) {
        correctCount++;
      }
    });
    
    // Set score and mark test as submitted
    setScore(correctCount);
    setTestSubmitted(true);
    
    // Log for debugging
    console.log("Test submitted with score:", correctCount, "/", mcqs.length);
  }, [mcqs, userAnswers]);

  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining === 0) {
      // Time's up - submit the test automatically
      setTimerActive(false);
      submitTest();
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, submitTest]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startTest = () => {
    setTestMode(true);
    setTestSubmitted(false);
    setUserAnswers(new Array(mcqs.length).fill(null));
    
    // Set up timer
    setTimeRemaining(testTime * 60);
    setTimerActive(true);
  };

  const handleAnswerSelect = (questionIndex, option) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = option;
    setUserAnswers(newAnswers);
  };

  const resetTest = () => {
    setTestMode(false);
    setTestSubmitted(false);
    setUserAnswers(new Array(mcqs.length).fill(null));
    setTimerActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setMcqs([]);
    setTestMode(false);
    setTestSubmitted(false);
    setUserAnswers([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('numQuestions', numQuestions);
    formData.append('difficulty', difficulty); // Add difficulty level

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate MCQs');
      }

      setMcqs(data.mcqs);
      // Initialize user answers array with nulls for each question
      setUserAnswers(new Array(data.mcqs.length).fill(null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadMCQs = () => {
    const mcqsData = JSON.stringify(mcqs, null, 2);
    const blob = new Blob([mcqsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcqs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Quiz Maker</h1>
        <p>Upload a PDF to generate multiple-choice questions automatically</p>
      </header>

      <main className="content-wrapper">
        {!testMode && (
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="file-upload">Upload PDF</label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="num-questions">Number of Questions</label>
              <input
                id="num-questions"
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <div className="difficulty-selector">
                <button 
                  type="button"
                  className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  Easy
                </button>
                <button 
                  type="button"
                  className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  Medium
                </button>
                <button 
                  type="button"
                  className={`difficulty-btn ${difficulty === 'difficult' ? 'active' : ''}`}
                  onClick={() => setDifficulty('difficult')}
                >
                  Difficult
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="test-time">Test Time (Minutes)</label>
              <input
                id="test-time"
                type="number"
                min="1"
                max="60"
                value={testTime}
                onChange={(e) => setTestTime(parseInt(e.target.value))}
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Generating...' : 'Upload PDF and Get Quiz'}
            </button>
          </form>
        )}

        {error && <div className="error-message">{error}</div>}

        {mcqs.length > 0 && !testMode && !loading && (
          <div className="results">
            <div className="controls">
              <button onClick={startTest} className="test-btn">Take Test</button>
              <button onClick={handlePrint} className="print-btn">Print MCQs</button>
              <button onClick={downloadMCQs} className="download-btn">Download JSON</button>
            </div>

            <h2>Generated Questions</h2>
            <div className="mcq-list">
              {mcqs.map((mcq, index) => (
                <div key={index} className="mcq-item">
                  <h3>Question {index + 1}</h3>
                  <p className="question">{mcq.question}</p>
                  <ul className="options">
                    {mcq.options.map((option, optIndex) => (
                      <li key={optIndex}>{option}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {/* Answer Key for Print */}
            <div className="answer-key print-answer-key">
              <h2>Answer Key</h2>
              <ol>
                {mcqs.map((mcq, idx) => (
                  <li key={idx}><strong>Q{idx + 1}:</strong> {mcq.correctAnswer}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {testMode && mcqs.length > 0 && (
          <div className="test-mode">
            <div className="test-header">
              <h2>{testSubmitted ? 'Test Results' : 'Test Mode'}</h2>
              <div className="test-info">
                {!testSubmitted && (
                  <div className="timer">
                    Time Remaining: <span className={timeRemaining < 60 ? 'timer-warning' : ''}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
                <button onClick={resetTest} className="exit-btn">Exit Test</button>
              </div>
            </div>

            <div className="mcq-list">
              {mcqs.map((mcq, index) => (
                <div key={index} className="mcq-item">
                  <h3>Question {index + 1}</h3>
                  <p className="question">{mcq.question}</p>
                  <ul className="options test-options">
                    {mcq.options.map((option, optIndex) => (
                      <li 
                        key={optIndex}
                        className={`
                          ${userAnswers[index] === option ? 'selected' : ''}
                          ${testSubmitted && option === mcq.correctAnswer ? 'correct-answer' : ''}
                          ${testSubmitted && userAnswers[index] === option && option !== mcq.correctAnswer ? 'wrong-answer' : ''}
                        `}
                        onClick={() => !testSubmitted && handleAnswerSelect(index, option)}
                      >
                        {option}
                        {testSubmitted && option === mcq.correctAnswer && ' ✓'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="test-controls">
              {!testSubmitted ? (
                <>
                  <button 
                    onClick={submitTest}
                    disabled={userAnswers.includes(null)}
                    className="submit-btn"
                  >
                    Submit Test
                  </button>
                  {userAnswers.includes(null) && (
                    <p className="warning">Please answer all questions before submitting.</p>
                  )}
                </>
              ) : (
                <div className="test-results">
                  <h3>Your Score: {score} out of {mcqs.length} ({Math.round((score/mcqs.length) * 100)}%)</h3>
                  <button onClick={() => setTestSubmitted(false)} className="review-btn">Review Answers</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;