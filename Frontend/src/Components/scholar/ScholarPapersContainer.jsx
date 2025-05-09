// ScholarResultContainer.jsx
import { useState, useEffect } from "react";
import { ExternalLink, Bookmark, Search, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

// Scholar Papers Container Component
export function ScholarPapersContainer({ searchTerm }) {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedPapers, setSavedPapers] = useState({});

  useEffect(() => {
    const fetchScholarPapers = async () => {
      if (!searchTerm) return;
      
      setIsLoading(true);
      try {
        const response = await axios.post('/api/scholar', { topic: searchTerm });
        setPapers(response.data || []);
      } catch (err) {
        console.error('Error fetching scholar papers:', err);
        setError('Failed to load academic papers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarPapers();
  }, [searchTerm]);

  const toggleSavedPaper = (id) => {
    setSavedPapers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-brand-text">Academic Research</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="h-3 w-3 bg-brand-purple rounded-full"></div>
                <div className="h-3 w-3 bg-brand-purple rounded-full"></div>
                <div className="h-3 w-3 bg-brand-purple rounded-full"></div>
              </div>
            </div>
            <p className="text-center text-sm text-brand-textSecondary">
              Fetching academic papers...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-brand-text">Academic Research</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl text-brand-text">Academic Research</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {papers.length > 0 ? (
          <>
            <p className="text-sm text-brand-textSecondary">
              Found {papers.length} academic papers related to "{searchTerm}"
            </p>
            <div className="space-y-4">
              {papers.map((paper, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4">
                  <h3 className="font-medium text-brand-text">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-brand-textSecondary mt-1">
                    {paper.publication_info?.summary || "Publication info not available"}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {paper.cited_by?.value ? `${paper.cited_by.value} citations` : "No citation data"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => toggleSavedPaper(paper.position)}
                      >
                        <Bookmark size={14} className={savedPapers[paper.position] ? "fill-brand-purple text-brand-purple" : ""} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => window.open(paper.link, '_blank')}
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-brand-textSecondary">
            {searchTerm ? "No academic papers found for this topic." : "Enter a search term to find academic papers."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}