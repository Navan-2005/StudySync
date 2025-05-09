import React, { useState, useEffect, useCallback } from 'react';

function Mcq() {
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

    <div className="min-h-screen w-full bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800 py-8 border-b border-gray-700 mb-8">
        <h1 className="text-4xl font-bold text-white text-center m-0">AI Quiz Maker</h1>
        <p className="text-base opacity-80 text-center mt-2 mb-0">Upload a PDF to generate multiple-choice questions automatically</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 w-full box-border">
        {!testMode && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
            <div className="mb-5 text-left">
              <label htmlFor="file-upload" className="block mb-2 font-semibold text-gray-200">Upload PDF</label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-700 rounded bg-gray-700 text-gray-200 text-base"
              />
            </div>
            
            <div className="mb-5 text-left">
              <label htmlFor="num-questions" className="block mb-2 font-semibold text-gray-200">Number of Questions</label>
              <input
                id="num-questions"
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-24 p-3 border border-gray-700 rounded bg-gray-700 text-gray-200 text-base"
              />
            </div>
            
            <div className="mb-5 text-left">
              <label htmlFor="difficulty" className="block mb-2 font-semibold text-gray-200">Difficulty Level</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  className={`flex-1 p-2 rounded border ${difficulty === 'easy' ? 'bg-green-600 text-white font-bold border-green-700' : 'bg-gray-700 border-gray-600 text-gray-200'} transition-all`}
                  onClick={() => setDifficulty('easy')}
                >
                  Easy
                </button>
                <button 
                  type="button"
                  className={`flex-1 p-2 rounded border ${difficulty === 'medium' ? 'bg-green-600 text-white font-bold border-green-700' : 'bg-gray-700 border-gray-600 text-gray-200'} transition-all`}
                  onClick={() => setDifficulty('medium')}
                >
                  Medium
                </button>
                <button 
                  type="button"
                  className={`flex-1 p-2 rounded border ${difficulty === 'difficult' ? 'bg-green-600 text-white font-bold border-green-700' : 'bg-gray-700 border-gray-600 text-gray-200'} transition-all`}
                  onClick={() => setDifficulty('difficult')}
                >
                  Difficult
                </button>
              </div>
            </div>

            <div className="mb-5 text-left">
              <label htmlFor="test-time" className="block mb-2 font-semibold text-gray-200">Test Time (Minutes)</label>
              <input
                id="test-time"
                type="number"
                min="1"
                max="60"
                value={testTime}
                onChange={(e) => setTestTime(parseInt(e.target.value))}
                className="w-24 p-3 border border-gray-700 rounded bg-gray-700 text-gray-200 text-base"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 mt-3 bg-green-600 text-white rounded font-bold text-lg disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Generating...' : 'Upload PDF and Get Quiz'}
            </button>
          </form>
        )}

        {error && (
          <div className="text-red-400 my-5 p-3 bg-gray-700 rounded border border-red-800">
            {error}
          </div>
        )}

        {mcqs.length > 0 && !testMode && !loading && (
          <div>
            <div className="flex justify-center gap-2 my-5">
              <button 
                onClick={startTest} 
                className="bg-red-600 text-white border-none py-3 px-5 rounded text-base font-medium hover:bg-red-700 transition-colors"
              >
                Take Test
              </button>
              <button 
                onClick={handlePrint} 
                className="bg-gray-700 text-gray-200 border border-gray-600 py-3 px-5 rounded text-base hover:bg-gray-600 transition-colors"
              >
                Print MCQs
              </button>
              <button 
                onClick={downloadMCQs} 
                className="bg-gray-700 text-gray-200 border border-gray-600 py-3 px-5 rounded text-base hover:bg-gray-600 transition-colors"
              >
                Download JSON
              </button>
            </div>

            <h2 className="text-2xl font-bold text-center mt-8 mb-4">Generated Questions</h2>
            <div className="mt-5">
              {mcqs.map((mcq, index) => (
                <div key={index} className="bg-gray-800 p-5 mb-5 rounded-lg shadow border border-gray-700 text-left">
                  <h3 className="text-lg font-medium text-gray-200 mt-0">Question {index + 1}</h3>
                  <p className="font-semibold mb-4 text-lg text-gray-200">{mcq.question}</p>
                  <ul className="list-none p-0">
                    {mcq.options.map((option, optIndex) => (
                      <li 
                        key={optIndex} 
                        className="p-3 mb-2 border border-gray-700 rounded bg-gray-700 text-gray-200"
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {/* Answer Key for Print */}
            <div className="mt-10 bg-gray-800 rounded-lg p-6 shadow border border-gray-700 text-left hidden print:block">
              <h2 className="mt-0 text-green-500 text-xl font-bold">Answer Key</h2>
              <ol className="pl-6">
                {mcqs.map((mcq, idx) => (
                  <li key={idx} className="mb-2 text-lg"><strong>Q{idx + 1}:</strong> {mcq.correctAnswer}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {testMode && mcqs.length > 0 && (
          <div className="w-full max-w-6xl mx-auto bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">{testSubmitted ? 'Test Results' : 'Test Mode'}</h2>
              <div className="flex items-center gap-4">
                {!testSubmitted && (
                  <div className="text-lg font-bold">
                    Time Remaining: <span className={timeRemaining < 60 ? 'text-red-500' : ''}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
                <button 
                  onClick={resetTest} 
                  className="bg-gray-700 py-2 px-4 rounded text-gray-200 border border-gray-600 hover:bg-gray-600 transition-colors"
                >
                  Exit Test
                </button>
              </div>
            </div>

            <div className="mt-5">
              {mcqs.map((mcq, index) => (
                <div key={index} className="bg-gray-800 p-5 mb-5 rounded-lg shadow border border-gray-700 text-left">
                  <h3 className="text-lg font-medium text-gray-200 mt-0">Question {index + 1}</h3>
                  <p className="font-semibold mb-4 text-lg text-gray-200">{mcq.question}</p>
                  <ul className="list-none p-0">
                    {mcq.options.map((option, optIndex) => (
                      <li 
                        key={optIndex}
                        className={`p-3 mb-2 border rounded text-left transition-all transform hover:translate-x-1 cursor-pointer
                          ${userAnswers[index] === option ? 'bg-blue-800 border-blue-700' : 'bg-gray-700 border-gray-600'}
                          ${testSubmitted && option === mcq.correctAnswer ? 'bg-green-800 border-green-700' : ''}
                          ${testSubmitted && userAnswers[index] === option && option !== mcq.correctAnswer ? 'bg-red-800 border-red-700' : ''}
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

            <div className="mt-8 text-center pt-5 border-t border-gray-700">
              {!testSubmitted ? (
                <>
                  <button 
                    onClick={submitTest}
                    disabled={userAnswers.includes(null)}
                    className="bg-green-600 py-3 px-6 text-white rounded font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Test
                  </button>
                  {userAnswers.includes(null) && (
                    <p className="text-red-400 text-sm mt-2">Please answer all questions before submitting.</p>
                  )}
                </>
              ) : (
                <div className="my-5 mx-auto text-center p-5 bg-gray-800 rounded-lg border border-gray-700 w-full max-w-lg shadow-md">
                  <h3 className="text-2xl font-bold text-gray-200 mb-4">Your Score: {score} out of {mcqs.length} ({Math.round((score/mcqs.length) * 100)}%)</h3>
                  <button 
                    onClick={() => setTestSubmitted(false)} 
                    className="bg-gray-700 py-2 px-4 rounded text-gray-200 border border-gray-600 hover:bg-gray-600 transition-colors"
                  >
                    Review Answers
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Print styles - Add to head of document */}
      <style type="text/css" media="print">{`
        @media print {
          header, form, .controls, .flex.justify-center, [class*="test-controls"], [class*="test-header"] button {
            display: none !important;
          }
          
          [class*="mcq-item"] {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          body, [class*="App"] {
            background-color: white !important;
            color: black !important;
          }
          
          [class*="mcq-item"], [class*="bg-gray-800"] {
            background-color: white !important;
            border: 1px solid #ddd !important;
            color: black !important;
            box-shadow: none !important;
          }
          
          p, h3, li {
            color: black !important;
          }
          
          li {
            background-color: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
          }

          [class*="answer-key"] {
            display: block !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            page-break-before: always;
          }
          
          [class*="answer-key"] h2 {
            color: black !important;
          }
          
          .hidden.print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
    
  );
}

export default Mcq;