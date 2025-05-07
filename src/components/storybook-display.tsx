"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, ImageOff, BookOpenText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StorybookDisplayProps {
  storyText: string;
  imageUrls: (string | null)[];
  isLoadingImages: boolean;
  childName: string;
}

type ImageStatus = 'loading' | 'loaded' | 'error' | 'no-image-expected' | 'initial';

export function StorybookDisplay({ storyText, imageUrls, isLoadingImages, childName }: StorybookDisplayProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageStatus[]>([]);

  useEffect(() => {
    const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
    setPages(paragraphs);
    setCurrentPage(0);
    // Initialize status for all potential pages based on the number of paragraphs.
    setImageLoadingStatus(Array(paragraphs.length).fill('initial'));
  }, [storyText]);

  useEffect(() => {
    if (pages.length === 0) {
        // If pages array is empty (e.g. storyText was empty or being fetched),
        // ensure imageLoadingStatus is also empty.
        if(imageLoadingStatus.length > 0) setImageLoadingStatus([]);
        return;
    }

    const newStatusArray: ImageStatus[] = pages.map((_, index) => {
      // index corresponds to the page number (0-indexed)

      // Check if an image was "expected" for this page.
      // imageUrls.length is the number of prompts.
      if (index >= imageUrls.length) {
        return 'no-image-expected'; // No image prompt was generated for this story paragraph
      }

      const imageUrl = imageUrls[index]; // URL for the current page index, if available

      if (imageUrl) {
        return 'loaded';
      }

      // If we reach here: an image is expected (index < imageUrls.length) but imageUrls[index] is null.
      if (isLoadingImages) {
        // Overall image generation process for the story is active,
        // and this specific image (imageUrls[index]) hasn't loaded yet.
        return 'loading';
      } else {
        // Overall image generation process for the story is finished.
        // Since imageUrls[index] is still null here, it means this specific image failed or was not generated.
        return 'error';
      }
    });

    // Update state only if the content of the status array has actually changed.
    setImageLoadingStatus(currentStatuses => {
      if (JSON.stringify(currentStatuses) !== JSON.stringify(newStatusArray)) {
        return newStatusArray;
      }
      return currentStatuses;
    });
  }, [imageUrls, isLoadingImages, pages, imageLoadingStatus.length]);


  const totalPages = pages.length;
  const currentImageStatus: ImageStatus = imageLoadingStatus[currentPage] || 'initial';
  const currentImageUrl = imageUrls[currentPage];


  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    // Adjust currentPage if it becomes out of bounds due to pages changing
    if (pages.length > 0) {
      if (currentPage >= pages.length) {
        setCurrentPage(pages.length - 1);
      } else if (currentPage < 0) { // Should not happen with current logic but good guard
        setCurrentPage(0);
      }
    } else {
       // if pages become empty, reset current page
       setCurrentPage(0);
    }
  }, [currentPage, pages.length]);


  if (pages.length === 0 && isLoadingImages) {
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
  if (pages.length === 0) { // Handles case where story is empty or still loading (but not in explicit isLoadingImages phase)
      return (
        <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-2xl border-4 border-secondary rounded-2xl bg-card">
            <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Preparing your story...</p>
            </CardContent>
        </Card>
      );
  }


  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-2xl border-4 border-secondary rounded-2xl bg-card transform transition-transform hover:scale-[1.01] duration-300">
      <CardContent className="p-6 md:p-10 flex flex-col items-center">
         <h2 className="text-2xl font-bold text-primary mb-6 text-center">{childName}'s Magical Story!</h2>

        <div className="w-full aspect-video relative mb-6 rounded-xl overflow-hidden bg-muted/30 border-2 border-accent/30 flex items-center justify-center text-center">
          {currentImageStatus === 'loaded' && currentImageUrl ? (
            <Image
              src={currentImageUrl}
              alt={`Story illustration for page ${currentPage + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              className="transition-opacity duration-500 ease-in-out"
              data-ai-hint="storybook illustration kids"
              priority={currentPage === 0}
              unoptimized // Data URIs are already self-contained
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
          ): currentImageStatus === 'no-image-expected' ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground/60 p-4 h-full bg-muted/20">
               <BookOpenText className="h-10 w-10 mb-3 text-muted-foreground/50" />
               <span className="text-sm italic">This page is text only.</span>
           </div>
          ) : ( // 'initial' or other unexpected states
             <div className="flex flex-col items-center justify-center text-muted-foreground/50 p-4 h-full">
              <Loader2 className="h-10 w-10 animate-spin mb-3 text-muted-foreground/40" />
              <span className="text-sm">Picture coming soon...</span>
            </div>
          )}
        </div>

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
            disabled={currentPage === totalPages - 1 || totalPages === 0}
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
