export function ScholarAuthorsContainer({ searchTerm }) {
    const [authors, setAuthors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchScholarAuthors = async () => {
        if (!searchTerm) return;
        
        setIsLoading(true);
        try {
          const response = await axios.post('/api/scholar/authors', { topic: searchTerm });
          setAuthors(response.data || []);
        } catch (err) {
          console.error('Error fetching scholar authors:', err);
          setError('Failed to load authors. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchScholarAuthors();
    }, [searchTerm]);
  
    if (isLoading) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-brand-text">Research Experts</CardTitle>
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
                Finding authors in this field...
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
            <CardTitle className="text-xl text-brand-text">Research Experts</CardTitle>
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
          <CardTitle className="text-xl text-brand-text">Research Experts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authors.length > 0 ? (
            <>
              <p className="text-sm text-brand-textSecondary">
                Top researchers in {searchTerm}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authors.map((author, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-brand-purple bg-opacity-10 flex items-center justify-center">
                        <User className="h-6 w-6 text-brand-purple" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-brand-text truncate">
                        {author.name}
                      </h3>
                      <p className="text-xs text-brand-textSecondary mt-1">
                        Scholar ID: {author.author_id}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-shrink-0"
                      onClick={() => window.open(author.link, '_blank')}
                    >
                      <ExternalLink size={14} className="mr-1" /> View
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-brand-textSecondary">
              {searchTerm ? "No authors found for this topic." : "Enter a search term to find research experts."}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }