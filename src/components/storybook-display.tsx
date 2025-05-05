"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StorybookDisplayProps {
  storyText: string;
  imageUrls: (string | null)[]; // Allow null for placeholders/loading state
  isLoadingImages: boolean;
}

export function StorybookDisplay({ storyText, imageUrls, isLoadingImages }: StorybookDisplayProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Split story text into pages (e.g., based on paragraphs or a fixed word count)
    // Simple paragraph split for now
    const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
    setPages(paragraphs);
    setCurrentPage(0); // Reset to first page when story changes
  }, [storyText]);

  const totalPages = pages.length;
  const imageIndex = Math.floor(currentPage / 2); // Show image every two text pages
  const currentImageUrl = imageUrls[imageIndex];

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  // Ensure currentPage doesn't exceed bounds if pages array changes
   useEffect(() => {
    if (currentPage >= pages.length && pages.length > 0) {
      setCurrentPage(pages.length - 1);
    }
   }, [currentPage, pages]);


  if (pages.length === 0) {
    return null; // Or a loading state for the story text itself
  }


  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg bg-card">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="w-full aspect-video relative mb-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {/* Conditionally render image or placeholder */}
          {currentImageUrl ? (
            <Image
              src={currentImageUrl}
              alt={`Story illustration for page ${currentPage + 1}`}
              layout="fill"
              objectFit="contain" // Changed to contain to prevent cropping
              className="transition-opacity duration-500 ease-in-out"
              data-ai-hint="storybook illustration"
            />
          ) : isLoadingImages && currentPage % 2 === 0 ? (
             <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span>Generating Illustration...</span>
             </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
              <span>Illustration for pages {imageIndex * 2 + 1}-{imageIndex*2 + 2}</span>
            </div>
           // <Skeleton className="h-full w-full" />
          )}
        </div>

        <p className="text-lg leading-relaxed mb-6 text-center min-h-[100px]">
          {pages[currentPage]}
        </p>

        <div className="flex justify-between w-full items-center mt-auto">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-5 w-5" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Next Page"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
