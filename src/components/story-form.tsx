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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  childName: z.string().min(1, { message: 'Child\'s name is required.' }),
  childAge: z.coerce.number().min(1, { message: 'Age must be at least 1.' }).max(12, { message: 'Age cannot be more than 12.' }),
  childPhoto: z.any().refine((fileList) => fileList?.length === 1, 'Child\'s photo is required.'),
  favoriteFoods: z.string().min(1, { message: 'Favorite foods are required.' }),
  preferredCartoonCharacters: z.string().min(1, { message: 'Favorite characters are required.' }),
  childInterests: z.string().min(10, { message: 'Interests description needs at least 10 characters.' }),
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
      childAge: undefined,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        onSubmit({ ...values, childPhotoDataUri: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="childName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter child's name" {...field} />
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
              <FormLabel>Child's Age</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter child's age" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="childPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Photo</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" {...photoRef} />
              </FormControl>
              <FormDescription>Upload a clear photo of the child.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="favoriteFoods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Foods</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Pizza, Apples, Ice Cream" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredCartoonCharacters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Cartoon Characters</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Paw Patrol, Peppa Pig" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="childInterests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Interests & Personality</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the child's interests and personality (e.g., loves dinosaurs, very curious, enjoys drawing)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storyCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a story category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Animals">Animals</SelectItem>
                  <SelectItem value="Bedtime">Bedtime</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Story...
            </>
          ) : (
            'Create My Story'
          )}
        </Button>
      </form>
    </Form>
  );
}
