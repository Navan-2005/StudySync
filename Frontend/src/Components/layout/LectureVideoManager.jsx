import { useState } from "react";
import { Upload, File, X, Check, Loader2 } from "lucide-react";

export default function FlashcardApp() {
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a PDF file.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/flashcard", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards.");
      }

      setFlashcards(data.flashcards);
      setSuccessMessage("Flashcards generated successfully!");
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const resetApp = () => {
    setFile(null);
    setFlashcards([]);
    setSuccessMessage("");
    setError("");
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PDF Flashcard Generator</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-6 max-w-4xl">
        {flashcards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-brand-text mb-6">
              Upload PDF to Generate Flashcards
            </h2>

            {/* Upload container */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
                ${error ? "border-red-400 bg-red-50" : "border-brand-purple/30 hover:border-brand-purple/50 bg-brand-background"}`}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="flex items-center gap-3 py-2">
                  <File className="text-brand-purple h-8 w-8" />
                  <span className="text-brand-text font-medium">{file.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200"
                  >
                    <X className="h-4 w-4 text-brand-textSecondary" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-brand-purple mb-4 animate-pulse-light" />
                  <p className="text-brand-text font-medium mb-1">Click to upload a PDF file</p>
                  <p className="text-brand-textSecondary text-sm">or drag and drop here</p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
                <X className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2">
                <Check className="h-5 w-5" />
                <p>{successMessage}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`mt-6 w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2
                ${!file || loading ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-brand-purple text-white hover:bg-brand-purple/90"}`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                "Generate Flashcards"
              )}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-text">
                Your Flashcards ({currentCardIndex + 1}/{flashcards.length})
              </h2>
              <button
                onClick={resetApp}
                className="py-2 px-4 rounded-lg text-brand-text bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Create New Flashcards
              </button>
            </div>

            {/* Flashcard display */}
            <div className="mb-6">
              <div 
                className="bg-white rounded-lg shadow-lg p-8 min-h-64 cursor-pointer"
                onClick={toggleAnswer}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-brand-textSecondary">Click card to reveal answer</span>
                  <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-sm">
                    Card {currentCardIndex + 1}
                  </span>
                </div>

                <div className="min-h-32">
                  <h3 className="text-lg font-bold text-brand-text mb-4">
                    {flashcards[currentCardIndex]?.question || "Question"}
                  </h3>
                  
                  {showAnswer && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-brand-text">
                        {flashcards[currentCardIndex]?.answer || "Answer"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-medium
                  ${currentCardIndex === 0 ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-brand-teal text-white hover:bg-brand-teal/90"}`}
              >
                Previous Card
              </button>
              <button
                onClick={nextCard}
                disabled={currentCardIndex === flashcards.length - 1}
                className={`flex-1 py-3 px-6 rounded-lg font-medium
                  ${currentCardIndex === flashcards.length - 1 ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-brand-purple text-white hover:bg-brand-purple/90"}`}
              >
                Next Card
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-brand-textSecondary border-t border-gray-200">
        <p className="text-sm">PDF Flashcard Generator &copy; 2025</p>
      </footer>
    </div>
  );
}