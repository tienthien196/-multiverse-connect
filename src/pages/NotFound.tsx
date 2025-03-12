
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import GodotLogo from "@/components/GodotLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background flex flex-col items-center justify-center p-4">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-0 w-72 h-72 bg-godot/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-godot/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <GodotLogo size={80} className="animate-float" />
        </div>
        
        <h1 className="text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-godot-dark to-godot">404</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for couldn't be found in the multiverse.
        </p>
        
        <Button 
          className="bg-godot hover:bg-godot-light text-white font-medium rounded-md px-6 py-6 h-12
          transition-all duration-300 ease-in-out shadow-md hover:shadow-glow" 
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
