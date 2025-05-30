import { Button } from "@/Components/ui/button";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-brand-textSecondary mb-6">Oops! This page seems to be missing</p>
        <p className="mb-8 max-w-md mx-auto text-brand-textSecondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          size="lg"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;