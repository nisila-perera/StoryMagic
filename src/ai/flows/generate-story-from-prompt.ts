'use server';

/**
 * @fileOverview Generates a personalized children's story based on user-provided details.
 *
 * - generateStoryFromPrompt - A function that handles the story generation process.
 * - GenerateStoryInput - The input type for the generateStoryFromPrompt function.
 * - GenerateStoryOutput - The return type for the generateStoryFromPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateStoryInputSchema = z.object({
  childName: z.string().describe("The child's name."),
  childAge: z.number().describe("The child's age in years."),
  childPhotoDataUri: z
    .string()
    .describe(
      "A photo of the child, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  favoriteFoods: z.string().describe("The child's favorite foods."),
  preferredCartoonCharacters: z.string().describe("The child's preferred cartoon characters."),
  childInterests: z.string().describe("A short description of the child's interests and personality."),
  storyCategory: z
    .enum(['Fantasy', 'Adventure', 'Animals', 'Bedtime'])
    .optional()
    .describe('Optional story category.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  storyText: z.string().describe('The generated story text.'),
  imagePrompts: z.array(z.string()).describe('Prompts for generating images to accompany the story.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStoryFromPrompt(
  input: GenerateStoryInput
): Promise<GenerateStoryOutput> {
  return generateStoryFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {
    schema: z.object({
      childName: z.string().describe("The child's name."),
      childAge: z.number().describe("The child's age in years."),
      childPhotoDataUri: z
        .string()
        .describe(
          "A photo of the child, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      favoriteFoods: z.string().describe("The child's favorite foods."),
      preferredCartoonCharacters: z.string().describe("The child's preferred cartoon characters."),
      childInterests: z.string().describe("A short description of the child's interests and personality."),
      storyCategory: z
        .enum(['Fantasy', 'Adventure', 'Animals', 'Bedtime'])
        .optional()
        .describe('Optional story category.'),
    }),
  },
  output: {
    schema: z.object({
      storyText: z.string().describe('The generated story text.'),
      imagePrompts: z.array(z.string()).describe('Prompts for generating images to accompany the story.'),
    }),
  },
  prompt: `You are a creative children's story writer. You will generate a personalized story based on the details provided about the child.

  Child's Name: {{{childName}}}
  Child's Age: {{{childAge}}}
  Child's Photo: {{media url=childPhotoDataUri}}
  Favorite Foods: {{{favoriteFoods}}}
  Preferred Cartoon Characters: {{{preferredCartoonCharacters}}}
  Child's Interests: {{{childInterests}}}
  Story Category: {{#if storyCategory}}{{{storyCategory}}}{{else}}General{{/if}}

  Write a story that is age-appropriate and incorporates the child's name, interests, and favorite things. Structure the story in a way that it can be split into sections, with the imagePrompts including a descriptive prompt for each section of the story that can be used to generate an image to display on that page.
  `,
});

const generateStoryFromPromptFlow = ai.defineFlow<
  typeof GenerateStoryInputSchema,
  typeof GenerateStoryOutputSchema
>(
  {
    name: 'generateStoryFromPromptFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
