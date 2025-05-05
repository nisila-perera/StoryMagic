'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving a story prompt.
 *
 * - improveStory - A function that takes a story prompt and enhances it.
 * - ImproveStoryInput - The input type for the improveStory function.
 * - ImproveStoryOutput - The return type for the improveStory function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImproveStoryInputSchema = z.object({
  storyPrompt: z
    .string()
    .describe('The original story prompt to be improved.'),
});
export type ImproveStoryInput = z.infer<typeof ImproveStoryInputSchema>;

const ImproveStoryOutputSchema = z.object({
  improvedStoryPrompt: z
    .string()
    .describe('The improved story prompt with enhanced details and creativity.'),
});
export type ImproveStoryOutput = z.infer<typeof ImproveStoryOutputSchema>;

export async function improveStory(input: ImproveStoryInput): Promise<ImproveStoryOutput> {
  return improveStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveStoryPrompt',
  input: {
    schema: z.object({
      storyPrompt: z
        .string()
        .describe('The original story prompt to be improved.'),
    }),
  },
  output: {
    schema: z.object({
      improvedStoryPrompt: z
        .string()
        .describe('The improved story prompt with enhanced details and creativity.'),
    }),
  },
  prompt: `You are a creative writing expert. Your task is to take the given story prompt and enhance it to be more engaging and imaginative.

Original Story Prompt: {{{storyPrompt}}}

Improved Story Prompt:`,
});

const improveStoryFlow = ai.defineFlow<
  typeof ImproveStoryInputSchema,
  typeof ImproveStoryOutputSchema
>({
  name: 'improveStoryFlow',
  inputSchema: ImproveStoryInputSchema,
  outputSchema: ImproveStoryOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
