import React from 'react';
import { Sparkles } from 'lucide-react'; // Changed icon to Sparkles for magic theme

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-background via-secondary/10 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center"> {/* Increased height */}
        <div className="mr-4 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" /> {/* Larger icon, pulse animation */}
          <span className="font-bold text-2xl text-primary tracking-tight"> {/* Larger, bolder font */}
            StoryMagic
          </span>
        </div>
        {/* Add navigation links here if needed - consider playful styling */}
        {/* <nav className="ml-auto flex gap-4">
          <a href="#" className="text-secondary-foreground hover:text-primary font-medium">Link 1</a>
          <a href="#" className="text-secondary-foreground hover:text-primary font-medium">Link 2</a>
        </nav> */}
      </div>
    </header>
  );
}
