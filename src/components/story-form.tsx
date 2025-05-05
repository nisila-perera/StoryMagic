
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react'; // Added Sparkles icon

// Keep schema the same, just update presentation
const formSchema = z.object({
  childName: z.string().min(1, { message: "Adventurer's name is needed!" }),
  childAge: z.coerce.number().min(1, { message: 'Age must be 1 or older.' }).max(12, { message: 'Max age is 12 for this magic!' }),
  childPhoto: z.any().refine((fileList) => fileList?.length === 1, "We need a picture of the hero!").refine(file => file?.[0]?.size <= 5 * 1024 * 1024, "Photo must be 5MB or less."), // Add size validation
  favoriteFoods: z.string().min(1, { message: "What yummy foods do they like?" }),
  preferredCartoonCharacters: z.string().min(1, { message: "Who are their favorite friends?" }),
  childInterests: z.string().min(10, { message: 'Tell us more! (At least 10 characters)' }),
  storyCategory: z.enum(['Fantasy', 'Adventure', 'Animals', 'Bedtime']).optional(),
});

type StoryFormValues = z.infer<typeof formSchema>;

interface StoryFormProps {
  onSubmit: (data: StoryFormValues & { childPhotoDataUri: string }) => Promise<void>;
  isLoading: boolean;
}

export function StoryForm({ onSubmit, isLoading }: StoryFormProps) {
  const form = useForm<StoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: '',
      childAge: undefined, // Initialize age as undefined
      childPhoto: undefined,
      favoriteFoods: '',
      preferredCartoonCharacters: '',
      childInterests: '',
      storyCategory: undefined,
    },
  });

  const photoRef = form.register("childPhoto");

  const handleFormSubmit = async (values: StoryFormValues) => {
    const file = values.childPhoto[0];
    if (file) {
      // Basic client-side type check
      if (!file.type.startsWith('image/')) {
        form.setError('childPhoto', { type: 'manual', message: 'Please upload an image file (jpg, png, gif, etc.).' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onSubmit({ ...values, childPhotoDataUri: reader.result as string });
      };
       reader.onerror = () => {
         form.setError('childPhoto', { type: 'manual', message: 'Could not read the photo file.' });
       };
      reader.readAsDataURL(file);
    } else {
       form.setError('childPhoto', { type: 'manual', message: 'Photo is required.' });
    }
  };

  return (
    <Form {...form}>
      {/* Use a more visually engaging form structure */}
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Group related fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="childName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-primary">Hero's Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Lily the Brave" {...field} className="text-base"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="childAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-primary">Age</FormLabel>
                <FormControl>
                  <Input
                      type="number"
                      placeholder="e.g., 5"
                      {...field}
                      value={field.value ?? ''} // Handle potential undefined
                      onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      min="1"
                      max="12"
                      className="text-base"
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         <FormField
          control={form.control}
          name="childPhoto"
          render={({ field }) => (
            <FormItem>
               <FormLabel className="text-lg font-semibold text-primary">Picture of the Hero</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/webp" // Be more specific
                  {...photoRef}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-base"
                 />
              </FormControl>
              <FormDescription className="text-sm text-muted-foreground">A clear photo works best for magic! (Max 5MB)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="favoriteFoods"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-accent">Favorite Fuel</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Star Cookies, Moon Cheese" {...field} className="text-base" />
                </FormControl>
                 <FormDescription className="text-sm text-muted-foreground">What snacks power their adventures?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferredCartoonCharacters"
            render={({ field }) => (
              <FormItem>
                 <FormLabel className="text-lg font-semibold text-accent">Favorite Friends</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sparkle Unicorn, Captain Comet" {...field} className="text-base" />
                </FormControl>
                 <FormDescription className="text-sm text-muted-foreground">Any buddies they'd like in the story?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="childInterests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-secondary">About the Hero</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What do they love? (e.g., exploring castles, talking to animals, building rockets)"
                  {...field}
                  rows={4}
                  className="text-base"
                />
              </FormControl>
               <FormDescription className="text-sm text-muted-foreground">This helps make the story extra special!</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storyCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-secondary">Adventure Type (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Choose a magical theme..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fantasy">Fantasy Lands</SelectItem>
                  <SelectItem value="Adventure">Exciting Quests</SelectItem>
                  <SelectItem value="Animals">Furry Friends</SelectItem>
                  <SelectItem value="Bedtime">Dreamy Tales</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
           type="submit"
           disabled={isLoading}
           className="w-full text-lg font-bold py-6 rounded-xl shadow-lg bg-gradient-to-r from-primary to-orange-400 hover:from-primary/90 hover:to-orange-400/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
         >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Conjuring Story...
            </>
          ) : (
             <>
              <Sparkles className="mr-2 h-6 w-6" />
              Create My Story!
             </>
          )}
        </Button>
      </form>
    </Form>
  );
}
