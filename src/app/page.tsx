
"use client";

import * as React from 'react';
import { useState } from 'react';
import { StoryForm } from '@/components/story-form';
import { StorybookDisplay } from '@/components/storybook-display';
import { generateStoryFromPrompt, GenerateStoryOutput } from '@/ai/flows/generate-story-from-prompt';
import { generateImageFromStoryScene } from '@/ai/flows/generate-image-from-story-scene';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react'; // Added Wand2 for magic feel

type StoryData = GenerateStoryOutput & {
  childPhotoDataUri: string;
  childName: string;
};

type ViewState = 'form' | 'loading' | 'story';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false); // Separate loading state for story generation
  const [isGeneratingImages, setIsGeneratingImages] = useState(false); // Separate loading state for image generation
  const { toast } = useToast();

  const handleFormSubmit = async (formData: any) => {
    setIsGeneratingStory(true);
    setViewState('loading'); // Show loading animation
    setStoryData(null); // Clear previous story
    setImageUrls([]); // Clear previous images

    try {
      const result = await generateStoryFromPrompt({
        childName: formData.childName,
        childAge: formData.childAge,
        childPhotoDataUri: formData.childPhotoDataUri,
        favoriteFoods: formData.favoriteFoods,
        preferredCartoonCharacters: formData.preferredCartoonCharacters,
        childInterests: formData.childInterests,
        storyCategory: formData.storyCategory,
      });

      const fullStoryData = {
        ...result,
        childPhotoDataUri: formData.childPhotoDataUri,
        childName: formData.childName,
      };
      setStoryData(fullStoryData);

      // Initialize imageUrls array with nulls
      const initialImageUrls = Array(Math.ceil(result.imagePrompts.length)).fill(null);
      setImageUrls(initialImageUrls);

      // Story is ready, now show the story view (images will load in)
      setViewState('story');
      setIsGeneratingStory(false); // Story generation finished

      toast({
        title: 'Story Created!',
        description: 'Your magical adventure awaits!',
      });

      // Start generating images *after* transitioning to story view
      generateImages(fullStoryData);

    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Oops!',
        description: 'Something went wrong creating the story. Please try again.',
        variant: 'destructive',
      });
      setViewState('form'); // Go back to form on error
      setIsGeneratingStory(false);
    }
  };

 const generateImages = async (currentStoryData: StoryData) => {
    if (!currentStoryData) return;

    setIsGeneratingImages(true);
    const generatedUrls: (string | null)[] = [...imageUrls]; // Start with current state (all nulls)

    try {
      // Generate images sequentially
      for (let i = 0; i < currentStoryData.imagePrompts.length; i++) {
        // Ensure component hasn't unmounted or story changed
        if (viewState !== 'story' || storyData?.storyText !== currentStoryData.storyText) break;

        const sceneDescription = currentStoryData.imagePrompts[i];
        try {
          const imageResult = await generateImageFromStoryScene({
            childName: currentStoryData.childName,
            childPhotoDataUri: currentStoryData.childPhotoDataUri,
            sceneDescription: sceneDescription,
          });
          generatedUrls[i] = imageResult.generatedImageUrl;
          // Update state progressively
          setImageUrls([...generatedUrls]);
        } catch (imageError) {
            console.error(`Error generating image for prompt ${i}:`, imageError);
             toast({
               title: 'Image Glitch!',
               description: `Could not draw picture ${i + 1}.`,
               variant: 'destructive',
             });
             // Keep null in the array
        }
      }
    } catch (error) {
        console.error('Error during image generation loop:', error);
        toast({
          title: 'Oops!',
          description: 'An error occurred while drawing the pictures.',
          variant: 'destructive',
        });
    } finally {
        setIsGeneratingImages(false); // Mark image generation as complete
    }
};


  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      {viewState === 'form' && (
        <Card className="w-full max-w-2xl shadow-lg border-primary border-2 animate-fade-in">
          <CardHeader className="bg-primary/10">
            <CardTitle className="text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
              <Wand2 className="h-8 w-8" /> Create Your StoryMagic
            </CardTitle>
            <CardDescription className="text-center text-lg text-foreground/80 pt-1">
              Tell us a little about your adventurer!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <StoryForm onSubmit={handleFormSubmit} isLoading={isGeneratingStory} />
          </CardContent>
        </Card>
      )}

      {viewState === 'loading' && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center animate-fade-in">
          <Wand2 className="h-16 w-16 animate-bounce text-primary mb-6" />
          <h2 className="text-2xl font-bold text-primary mb-2">Abracadabra!</h2>
          <p className="text-lg text-muted-foreground">Weaving your magical tale...</p>
           <Loader2 className="h-8 w-8 animate-spin text-secondary mt-4" />
        </div>
      )}

      {viewState === 'story' && storyData && (
        <div className="w-full animate-fade-in">
          {/* Two-column layout for story and images (already handled by StorybookDisplay) */}
           <StorybookDisplay
              storyText={storyData.storyText}
              imageUrls={imageUrls}
              isLoadingImages={isGeneratingImages} // Pass down the image loading state
              childName={storyData.childName}
           />
        </div>
      )}
    </div>
  );
}
