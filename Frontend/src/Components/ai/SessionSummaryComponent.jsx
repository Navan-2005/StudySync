import { useState, useEffect } from 'react';
import { FileText, Copy, RefreshCw } from 'lucide-react';

export default function SessionSummaryComponent({ transcriptionData, onClose }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (transcriptionData && transcriptionData.trim()) {
      generateSummary(transcriptionData);
    }
  }, [transcriptionData]);

  const generateSummary = async (text) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (transcriptionData) {
      generateSummary(transcriptionData);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden text-white w-full max-w-md mx-auto">
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="mr-2" size={20} />
          <h2 className="font-medium">Session Summary</h2>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="text-white hover:text-blue-200 disabled:text-gray-400"
            title="Refresh Summary"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={copyToClipboard}
            className="text-white hover:text-blue-200"
            title={copied ? "Copied!" : "Copy to Clipboard"}
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">Generating your meeting summary...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
            >
              Try again
            </button>
          </div>
        ) : summary ? (
          <div className="bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="prose prose-sm prose-invert">
              {summary.split('\n').map((paragraph, i) => (
                paragraph.trim() ? <p key={i} className="mb-2 text-gray-100">{paragraph}</p> : <br key={i} />
              ))}
            </div>
            {copied && (
              <div className="mt-2 text-xs text-green-400">
                ✓ Summary copied to clipboard
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 italic text-center py-8">
            No session data available for summary.
          </p>
        )}
      </div>
    </div>
  );
}