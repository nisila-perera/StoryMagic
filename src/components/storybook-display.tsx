
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react'; // Added ImageOff for failed images
import { Skeleton } from '@/components/ui/skeleton';

interface StorybookDisplayProps {
  storyText: string;
  imageUrls: (string | null)[]; // Allow null for placeholders/loading state/errors
  isLoadingImages: boolean; // Track overall image loading process
  childName: string; // Added child's name for personalization
}

export function StorybookDisplay({ storyText, imageUrls, isLoadingImages, childName }: StorybookDisplayProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Track loading status for *each* image slot independently
  const [imageLoadingStatus, setImageLoadingStatus] = useState<('loading' | 'loaded' | 'error' | 'pending')[]>([]);

  useEffect(() => {
    // Split story into paragraphs, assuming each paragraph is a page
    const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
    setPages(paragraphs);
    setCurrentPage(0); // Reset to first page when story changes

    // Initialize image loading status based on initial imageUrls length
    setImageLoadingStatus(Array(Math.ceil(paragraphs.length / 1)).fill('pending')); // Image per page now

  }, [storyText]);

  useEffect(() => {
    // Update loading status when imageUrls change
    setImageLoadingStatus(prevStatus => {
      return imageUrls.map((url, index) => {
        if (url) return 'loaded';
        // Keep 'error' status if previously set
        if (prevStatus[index] === 'error') return 'error';
        // If still loading overall and no URL yet, mark as 'loading'
        // Check if index is within bounds before accessing prevStatus
        if (isLoadingImages && index < prevStatus.length && prevStatus[index] !== 'loaded') return 'loading';
        // If not loading overall and no URL, mark as 'error' (assuming generation finished without this image)
        if (!isLoadingImages && !url) return 'error';
        // Otherwise, it's pending or something unexpected
        return 'pending';
      });
    });
  }, [imageUrls, isLoadingImages]);


  const totalPages = pages.length;
  // One image per page now
  const imageIndex = currentPage;
  const currentImageUrl = imageUrls[imageIndex];
  const currentImageStatus = imageLoadingStatus[imageIndex] || 'pending';

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
    } else if (currentPage < 0 && pages.length > 0) {
       setCurrentPage(0);
     }
   }, [currentPage, pages]);


  if (pages.length === 0) {
    // Could show a loading skeleton for the whole storybook here
    return (
      <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-2xl border-4 border-secondary rounded-2xl bg-card">
         <CardContent className="p-6 md:p-10 flex flex-col items-center">
            <Skeleton className="w-full aspect-video mb-6 rounded-xl"/>
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            <div className="flex justify-between w-full items-center mt-auto">
                <Skeleton className="h-10 w-24 rounded-lg" />
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
         </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-2xl border-4 border-secondary rounded-2xl bg-card transform transition-transform hover:scale-[1.01] duration-300">
      <CardContent className="p-6 md:p-10 flex flex-col items-center">
         <h2 className="text-2xl font-bold text-primary mb-6 text-center">{childName}'s Magical Story!</h2>

        <div className="w-full aspect-video relative mb-6 rounded-xl overflow-hidden bg-muted/50 border-2 border-accent/50 flex items-center justify-center text-center">
          {currentImageStatus === 'loaded' && currentImageUrl ? (
            <Image
              src={currentImageUrl}
              alt={`Story illustration for page ${currentPage + 1}`}
              fill // Use fill instead of layout
              style={{ objectFit: 'contain' }} // Use style prop for objectFit
              className="transition-opacity duration-500 ease-in-out"
              data-ai-hint="storybook illustration kids"
              priority={currentPage === 0} // Prioritize loading the first image
              unoptimized // Consider adding if data URIs are large
            />
          ) : currentImageStatus === 'loading' ? (
             <div className="flex flex-col items-center justify-center text-accent-foreground/70 p-4">
                <Loader2 className="h-10 w-10 animate-spin mb-3 text-accent" />
                <span className="text-sm font-medium">Drawing the magic...</span>
             </div>
          ) : currentImageStatus === 'error' ? (
             <div className="flex flex-col items-center justify-center text-destructive/80 p-4">
                <ImageOff className="h-10 w-10 mb-3" />
                <span className="text-sm font-medium">Couldn't draw this part!</span>
              </div>
          ): (
             // Placeholder for 'pending' or unexpected states
             <div className="flex items-center justify-center h-full w-full bg-muted/30 text-muted-foreground/50 p-4">
              <span className="text-sm">Picture for this page is coming soon!</span>
            </div>
          )}
        </div>

        {/* Use a more playful text style */}
        <p className="text-xl leading-relaxed mb-8 text-foreground/90 text-center min-h-[120px] font-medium">
          {pages[currentPage]}
        </p>

        <div className="flex justify-between w-full items-center mt-auto pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 hover:text-primary font-bold shadow-md transition-transform hover:scale-105"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-6 w-6 mr-1" />
            Back
          </Button>
          <span className="text-md font-semibold text-muted-foreground">
            Page {currentPage + 1} / {totalPages}
          </span>
          <Button
             variant="outline"
             size="lg"
             className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 hover:text-primary font-bold shadow-md transition-transform hover:scale-105"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Next Page"
          >
            Next
            <ChevronRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
