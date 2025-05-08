import { useState } from "react";
import { Search, Mic, Bookmark, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

export function TopicExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async() => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    try {
       const responce=await axios.post('http://localhost:3000/users/video',{topic:searchTerm});
       console.log(responce.data);      
        
    // Simulate API call delay
    setTimeout(() => {
      // Mock data
      // setSearchResult({
      //   summary: "Photosynthesis is the process by which plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. It's a vital process that produces oxygen as a byproduct, which most living organisms need for survival.",
      //   keyPoints: [
      //     "Occurs primarily in the chloroplasts of plant cells",
      //     "Requires sunlight, water, and carbon dioxide",
      //     "Produces glucose and oxygen",
      //     "Has light-dependent and light-independent reactions",
      //     "Essential for maintaining atmospheric oxygen levels"
      //   ],
      //   videos: [
      //     {
      //       id: "v1",
      //       title: "Photosynthesis | Educational Video for Kids",
      //       channel: "Science Explained",
      //       duration: "8:24",
      //       thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=225&fit=crop",
      //       saved: false
      //     },
      //     {
      //       id: "v2",
      //       title: "Photosynthesis: Light Reaction, Calvin Cycle, and Electron Transport",
      //       channel: "Professor Bio",
      //       duration: "12:16",
      //       thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop",
      //       saved: false
      //     },
      //     {
      //       id: "v3",
      //       title: "Understanding Photosynthesis in 5 Minutes",
      //       channel: "Quick Science",
      //       duration: "5:05",
      //       thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop",
      //       saved: false
      //     }
      //   ]
      // });
      setSearchResult({
        videos: responce.data
      })
      
      setIsSearching(false);
    }, 1500);
  } catch (error) {
    console.log('Error: ',error);      
  }
  };

  const toggleSavedVideo = (id) => {
    if (searchResult) {
      setSearchResult({
        ...searchResult,
        videos: searchResult.videos.map(video => 
          video.id === id ? { ...video, saved: !video.saved } : video
        )
      });
    }
  };

  const handleMicClick = () => {
    // For simplicity, just set a sample search term
    setSearchTerm("Photosynthesis");
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl text-brand-text">Ask Anything or Type a Topic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            className="w-full border border-gray-200 rounded-full py-2 px-4 pl-10 pr-12"
            placeholder="e.g., Photosynthesis, Newton's Laws..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1 rounded-full h-8 w-8" 
            onClick={handleMicClick}
          >
            <Mic size={16} />
          </Button>
        </div>
        <Button 
          className="w-full"
          onClick={handleSearch}
          disabled={isSearching || !searchTerm}
        >
          {isSearching ? "Exploring..." : "Explore"}
        </Button>

        {isSearching && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="h-3 w-3 bg-brand-purple rounded-full"></div>
                <div className="h-3 w-3 bg-brand-purple rounded-full"></div>
                <div className="h-3 w-3 bg-brand-purple rounded-full"></div>
              </div>
            </div>
            <p className="text-center text-sm text-brand-textSecondary">
              Analyzing topic...
            </p>
          </div>
        )}

        {/* Search Results */}
        {searchResult && !isSearching && (
          <div className="space-y-6">
            {/* AI Summary */}
            <div className="bg-soft-blue p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">About {searchTerm}</h3>
              <p className="text-sm mb-3">{searchResult.summary}</p>
              <h4 className="font-medium text-sm mb-1">Key Points:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {searchResult.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm">{point}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">Simplify More</Button>
                <Button size="sm" variant="outline">Give Examples</Button>
              </div>
            </div>

            {/* Videos */}
            <div>
              <h3 className="text-lg font-medium mb-3">Watch & Learn</h3>
              <div className="space-y-3">
                {searchResult.videos.map((video) => (
                  <div key={video.id} className="flex gap-3 border border-gray-100 rounded-lg overflow-hidden">
                    <div className="w-1/3 h-24 bg-gray-100">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-2 pr-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-brand-textSecondary mt-1">{video.channel}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {video.duration}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => toggleSavedVideo(video.id)}
                          >
                            <Bookmark size={14} className={video.saved ? "fill-brand-purple text-brand-purple" : ""} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Play size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Generate Flashcards
              </Button>
              <Button variant="outline" size="sm">
                Compare with Another Topic
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark size={14} className="mr-1" /> Bookmark Topic
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}