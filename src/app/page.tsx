
"use client";

import * as React from 'react';
import { useState } from 'react';
import { StoryForm } from '@/components/story-form';
import { StorybookDisplay } from '@/components/storybook-display';
import { generateStoryFromPrompt, GenerateStoryOutput } from '@/ai/flows/generate-story-from-prompt';
import { generateImageFromStoryScene } from '@/ai/flows/generate-image-from-story-scene';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react'; // Import Loader2

type StoryData = GenerateStoryOutput & {
  childPhotoDataUri: string;
  childName: string;
};

export default function Home() {
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (formData: any) => {
    setIsLoadingStory(true);
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
      toast({
        title: 'Story Generated!',
        description: 'Your personalized story is ready.',
      });

      // Initialize imageUrls array with nulls
      const initialImageUrls = Array(Math.ceil(result.imagePrompts.length)).fill(null);
      setImageUrls(initialImageUrls);

      // Start generating images after story is generated
      generateImages(fullStoryData);

    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate the story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStory(false);
    }
  };

 const generateImages = async (currentStoryData: StoryData) => {
    if (!currentStoryData) return;

    setIsLoadingImages(true);
    const generatedUrls: (string | null)[] = [...imageUrls]; // Start with current state (might be all nulls)

    try {
      // Generate images sequentially for simplicity and to avoid rate limits
      for (let i = 0; i < currentStoryData.imagePrompts.length; i++) {
        const sceneDescription = currentStoryData.imagePrompts[i];
        try {
          const imageResult = await generateImageFromStoryScene({
            childName: currentStoryData.childName,
            childPhotoDataUri: currentStoryData.childPhotoDataUri,
            sceneDescription: sceneDescription,
          });
          generatedUrls[i] = imageResult.generatedImageUrl;
          // Update state after each image generation to show progress
          setImageUrls([...generatedUrls]);
        } catch (imageError) {
            console.error(`Error generating image for prompt ${i}:`, imageError);
             // Keep null in the array for failed images, maybe add error state later
             toast({
               title: 'Image Generation Error',
               description: `Could not generate image for part ${i + 1}.`,
               variant: 'destructive',
             });
        }
      }
    } catch (error) {
        console.error('Error during image generation loop:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while generating images.',
          variant: 'destructive',
        });
    } finally {
        setIsLoadingImages(false);
    }
};


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">Create Your StoryMagic</CardTitle>
            <CardDescription className="text-center">Fill in the details below to generate a personalized story for your child.</CardDescription>
          </CardHeader>
          <CardContent>
            <StoryForm onSubmit={handleFormSubmit} isLoading={isLoadingStory} />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {isLoadingStory && (
            <Card className="flex flex-col items-center justify-center h-96 shadow-lg">
               <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
               <p className="text-muted-foreground">Generating your magical story...</p>
            </Card>
          )}
          {storyData && !isLoadingStory && (
             <StorybookDisplay
                storyText={storyData.storyText}
                imageUrls={imageUrls}
                isLoadingImages={isLoadingImages}
             />
          )}
          {!storyData && !isLoadingStory && (
             <Card className="flex flex-col items-center justify-center h-96 shadow-lg bg-card">
                <CardHeader>
                    <CardTitle className="text-xl text-center">Your Story Will Appear Here</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center">Fill out the form and click "Create My Story" to begin!</p>
                 </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
