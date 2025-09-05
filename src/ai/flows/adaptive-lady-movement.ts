'use server';

/**
 * @fileOverview Dynamically adjusts the lady's position in the game based on player interaction data.
 *
 * Exports:
 * - `adjustLadyPosition` - An asynchronous function that returns a new lady position.
 * - `AdjustLadyPositionInput` - The input type for the adjustLadyPosition function.
 * - `AdjustLadyPositionOutput` - The output type for the adjustLadyPosition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustLadyPositionInputSchema = z.object({
  gameHistory: z
    .array(
      z.object({
        clickX: z.number().describe('The x coordinate of the player\'s click.'),
        clickY: z.number().describe('The y coordinate of the player\'s click.'),
        ladyX: z.number().describe('The x coordinate of the lady\'s position.'),
        ladyY: z.number().describe('The y coordinate of the lady\'s position.'),
        score: z.number().describe('The score achieved in that round.'),
      })
    )
    .describe('An array of the previous game rounds data.'),
  canvasWidth: z.number().describe('The width of the game canvas.'),
  canvasHeight: z.number().describe('The height of the game canvas.'),
});

export type AdjustLadyPositionInput = z.infer<typeof AdjustLadyPositionInputSchema>;

const AdjustLadyPositionOutputSchema = z.object({
  newLadyX: z
    .number()
    .describe('The new x coordinate for the lady, adjusted for difficulty.'),
  newLadyY: z
    .number()
    .describe('The new y coordinate for the lady, adjusted for difficulty.'),
});

export type AdjustLadyPositionOutput = z.infer<typeof AdjustLadyPositionOutputSchema>;

export async function adjustLadyPosition(
  input: AdjustLadyPositionInput
): Promise<AdjustLadyPositionOutput> {
  return adjustLadyPositionFlow(input);
}

const adjustLadyPositionPrompt = ai.definePrompt({
  name: 'adjustLadyPositionPrompt',
  input: {schema: AdjustLadyPositionInputSchema},
  output: {schema: AdjustLadyPositionOutputSchema},
  prompt: `You are an AI game advisor, helping to make a game more challenging.

You will be provided with the game history, the current canvas size, and the previous lady position.

Based on the player's past performance, suggest a new position for the lady that makes the game more challenging.

Consider the following:

*   If the player is consistently scoring high points, move the lady to a more difficult-to-reach location.
*   If the player is struggling, keep the lady in a slightly easier location.
*   Make sure the new position is still within the bounds of the canvas.
*   The canvas width is {{{canvasWidth}}} and the canvas height is {{{canvasHeight}}}.

Here is the game history:

{{#each gameHistory}}
*   Click X: {{{clickX}}}, Click Y: {{{clickY}}}, Lady X: {{{ladyX}}}, Lady Y: {{{ladyY}}}, Score: {{{score}}}
{{/each}}

Return the new lady position as JSON.
`,
});

const adjustLadyPositionFlow = ai.defineFlow(
  {
    name: 'adjustLadyPositionFlow',
    inputSchema: AdjustLadyPositionInputSchema,
    outputSchema: AdjustLadyPositionOutputSchema,
  },
  async input => {
    const {output} = await adjustLadyPositionPrompt(input);
    return output!;
  }
);
