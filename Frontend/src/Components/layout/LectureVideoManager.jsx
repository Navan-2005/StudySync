import { useState, useEffect } from "react";
import { Upload, File, X, Check, Loader2, RefreshCw, Save, LogOut, List } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../features/auth/authSlice"; // Assuming you have authSlice

export default function FlashcardApp() {
  // Get user from Redux store
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // Flashcard states
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [studyMode, setStudyMode] = useState("learn"); // "learn" or "quiz"
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // User flashcard sets
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [viewMode, setViewMode] = useState("upload"); // "upload", "list", "study"
  const [selectedSetId, setSelectedSetId] = useState(null);

  // Check if user is authenticated on load
  useEffect(() => {
    if (user) {
      fetchFlashcardSets();
    }
  }, [user]);

  const fetchFlashcardSets = async () => {
    try {
      const response = await fetch("http://localhost:3000/flashcards/flashcard-sets", {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch flashcard sets");
      }
      
      const data = await response.json();
      setFlashcardSets(data.flashcardSets);
    } catch (err) {
      console.error("Error fetching flashcard sets", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setFlashcardSets([]);
    setViewMode("upload");
  };

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
      const response = await fetch("http://127.0.0.1:8000/flashcard", {
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
      setShowDefinition(false);
      setViewMode("study");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcardsToDatabase = async () => {
    if (!user) {
      setError("Please log in to save flashcards");
      return;
    }
    
    if (!saveTitle.trim()) {
      setError("Please provide a title for your flashcard set");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:3000/flashcards/save-flashcards", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: saveTitle,
          description: saveDescription,
          cards: flashcards
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save flashcards");
      }
      
      setSuccessMessage("Flashcards saved successfully!");
      setShowSaveForm(false);
      fetchFlashcardSets();
    } catch (err) {
      setError(err.message);
    }
  };

  const loadFlashcardSet = async (setId) => {
    try {
      const response = await fetch(`http://localhost:3000/flashcards/flashcard-sets/${setId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to load flashcard set");
      }
      
      setFlashcards(data.flashcardSet.cards);
      setSaveTitle(data.flashcardSet.title);
      setSaveDescription(data.flashcardSet.description);
      setCurrentCardIndex(0);
      setShowDefinition(false);
      setSelectedSetId(setId);
      setViewMode("study");
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteFlashcardSet = async (setId) => {
    if (!confirm("Are you sure you want to delete this flashcard set?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/flashcards/flashcard-sets/${setId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete flashcard set");
      }
      
      setSuccessMessage("Flashcard set deleted successfully");
      fetchFlashcardSets();
    } catch (err) {
      setError(err.message);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowDefinition(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowDefinition(false);
    }
  };

  const resetApp = () => {
    setFile(null);
    setFlashcards([]);
    setSuccessMessage("");
    setError("");
    setCurrentCardIndex(0);
    setShowDefinition(false);
    setViewMode("upload");
  };

  const toggleDefinition = () => {
    setShowDefinition(!showDefinition);
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setShowDefinition(false);
  };

  const toggleStudyMode = () => {
    setStudyMode(studyMode === "learn" ? "quiz" : "learn");
    setShowDefinition(false);
  };

  // Render flashcard set list
  const renderFlashcardSetList = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-text">Your Flashcard Sets</h2>
          <button
            onClick={() => setViewMode("upload")}
            className="py-2 px-4 rounded-lg text-white bg-brand-purple hover:bg-brand-purple/90 transition-colors flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Create New
          </button>
        </div>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2">
            <Check className="h-5 w-5" />
            <p>{successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <X className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        
        {flashcardSets.length === 0 ? (
          <div className="text-center py-8 text-brand-textSecondary">
            <p>You don't have any flashcard sets yet.</p>
            <button
              onClick={() => setViewMode("upload")}
              className="mt-4 py-2 px-4 rounded-lg text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/10 transition-colors"
            >
              Create your first set
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {flashcardSets.map(set => (
              <div key={set._id} className="border border-gray-200 rounded-lg p-4 hover:border-brand-purple/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-brand-text">{set.title}</h3>
                    <p className="text-brand-textSecondary text-sm mt-1">{set.description || "No description"}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-brand-textSecondary">
                      <span>Created: {new Date(set.createdAt).toLocaleDateString()}</span>
                      {set.lastStudied && (
                        <span>Last studied: {new Date(set.lastStudied).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadFlashcardSet(set._id)}
                      className="py-1 px-3 rounded-md text-white bg-brand-teal hover:bg-brand-teal/90 transition-colors text-sm"
                    >
                      Study
                    </button>
                    <button
                      onClick={() => deleteFlashcardSet(set._id)}
                      className="py-1 px-3 rounded-md text-red-600 bg-red-100 hover:bg-red-200 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render upload form
  const renderUploadForm = () => {
    return (
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
    );
  };

  // Render save form
  const renderSaveForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-fade-in">
        <h3 className="text-lg font-medium text-brand-text mb-4">Save Your Flashcards</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Enter a title for your flashcard set"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="Add a description for your flashcard set"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple h-24"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowSaveForm(false)}
              className="py-2 px-4 rounded-lg text-brand-text bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveFlashcardsToDatabase}
              className="py-2 px-4 rounded-lg text-white bg-brand-purple hover:bg-brand-purple/90 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Flashcards
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render flashcard display
  const renderFlashcards = () => {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-text">
            {saveTitle || "Your Flashcards"} ({currentCardIndex + 1}/{flashcards.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={shuffleCards}
              className="py-2 px-4 rounded-lg text-brand-text bg-white border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Shuffle
            </button>
            <button
              onClick={toggleStudyMode}
              className="py-2 px-4 rounded-lg text-white bg-brand-teal hover:bg-brand-teal/90 transition-colors"
            >
              {studyMode === "learn" ? "Switch to Quiz Mode" : "Switch to Learn Mode"}
            </button>
            {user && (
              <button
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="py-2 px-4 rounded-lg text-white bg-brand-purple hover:bg-brand-purple/90 transition-colors flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {selectedSetId ? "Update Set" : "Save Set"}
              </button>
            )}
            {user && (
              <button
                onClick={() => setViewMode("list")}
                className="py-2 px-4 rounded-lg text-brand-text bg-white border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                My Sets
              </button>
            )}
            <button
              onClick={resetApp}
              className="py-2 px-4 rounded-lg text-brand-text bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Create New
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <X className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2">
            <Check className="h-5 w-5" />
            <p>{successMessage}</p>
          </div>
        )}

        {showSaveForm && renderSaveForm()}

        {/* Flashcard display */}
        <div className="mb-6">
          <div 
            className="bg-white rounded-lg shadow-lg p-8 min-h-64 cursor-pointer"
            onClick={toggleDefinition}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-brand-textSecondary">
                {studyMode === "learn" ? "Study Mode" : "Quiz Mode"} - Click card to reveal
              </span>
              <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-sm">
                Card {currentCardIndex + 1}
              </span>
            </div>

            <div className="min-h-32 flex flex-col items-center justify-center">
              {studyMode === "learn" ? (
                <>
                  <h3 className="text-xl font-bold text-brand-text mb-4 text-center">
                    {flashcards[currentCardIndex]?.topic || "Topic"}
                  </h3>
                  
                  {showDefinition && (
                    <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                      <p className="text-brand-text text-center">
                        {flashcards[currentCardIndex]?.definition || "Definition"}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-brand-text mb-4 text-center">
                    {flashcards[currentCardIndex]?.definition || "Definition"}
                  </h3>
                  
                  {showDefinition && (
                    <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                      <p className="text-brand-text text-center font-bold">
                        {flashcards[currentCardIndex]?.topic || "Topic"}
                      </p>
                    </div>
                  )}
                </>
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
            onClick={toggleDefinition}
            className="flex-1 py-3 px-6 rounded-lg font-medium bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30"
          >
            {showDefinition ? "Hide Answer" : "Show Answer"}
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
    );
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-purple">Flashcard Generator</h1>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-brand-text">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="py-2 px-4 rounded-lg text-brand-text bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {!user ? (
          <div className="max-w-md mx-auto text-center py-12">
            <h2 className="text-xl font-bold text-brand-text mb-4">Please log in to use the Flashcard Generator</h2>
            <p className="text-brand-textSecondary mb-6">You need to be authenticated to access this application.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {viewMode === "upload" && renderUploadForm()}
            {viewMode === "list" && renderFlashcardSetList()}
            {viewMode === "study" && flashcards.length > 0 && renderFlashcards()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-brand-textSecondary text-sm">
          <p>Flashcard Generator App &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}