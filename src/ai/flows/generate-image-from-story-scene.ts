'use server';

/**
 * @fileOverview Generates an image based on a description of a scene in the story, incorporating the child's appearance and setting.
 *
 * - generateImageFromStoryScene - A function that handles the image generation process.
 * - GenerateImageFromStorySceneInput - The input type for the generateImageFromStoryScene function.
 * - GenerateImageFromStorySceneOutput - The return type for the generateImageFromStoryScene function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateImageFromStorySceneInputSchema = z.object({
  childName: z.string().describe("The child's name."),
  childPhotoDataUri: z
    .string()
    .describe(
      "A photo of the child, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  sceneDescription: z.string().describe('A description of the scene in the story.'),
});
export type GenerateImageFromStorySceneInput = z.infer<
  typeof GenerateImageFromStorySceneInputSchema
>;

const GenerateImageFromStorySceneOutputSchema = z.object({
  generatedImageUrl: z
    .string()
    .describe('The data URI of the generated image.'),
});
export type GenerateImageFromStorySceneOutput = z.infer<
  typeof GenerateImageFromStorySceneOutputSchema
>;

export async function generateImageFromStoryScene(
  input: GenerateImageFromStorySceneInput
): Promise<GenerateImageFromStorySceneOutput> {
  return generateImageFromStorySceneFlow(input);
}

// This ai.definePrompt is not directly used by the flow below, but kept for potential future reference or direct use.
// The flow itself constructs the prompt dynamically for ai.generate.
const generateImagePrompt = ai.definePrompt({
  name: 'generateImagePrompt',
  input: {
    schema: z.object({
      childName: z.string().describe("The child's name."),
      childPhotoDataUri: z
        .string()
        .describe(
          "A photo of the child, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      sceneDescription: z.string().describe('A description of the scene in the story.'),
    }),
  },
  output: {
    schema: z.object({
      generatedImageUrl: z
        .string()
        .describe('The data URI of the generated image.'),
    }),
  },
  prompt: `Generate an image of the following scene from a children's story, incorporating the child's appearance:

Scene Description: {{{sceneDescription}}}

Incorporate the appearance of {{childName}} from this photo: {{media url=childPhotoDataUri}}

Return the image as a data URI.
`,
});

const generateImageFromStorySceneFlow = ai.defineFlow<
  typeof GenerateImageFromStorySceneInputSchema,
  typeof GenerateImageFromStorySceneOutputSchema
>({
  name: 'generateImageFromStorySceneFlow',
  inputSchema: GenerateImageFromStorySceneInputSchema,
  outputSchema: GenerateImageFromStorySceneOutputSchema,
},
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.childPhotoDataUri}},
        {text: `Generate an image of ${input.childName} in a scene described as: "${input.sceneDescription}"`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      console.error("Image generation failed: No media object or URL returned from ai.generate.", { input, media });
      throw new Error("Image generation failed to produce a valid image URL.");
    }

    return {
      generatedImageUrl: media.url,
    };
  }
);
