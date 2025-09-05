'use server';
/**
 * @fileOverview An AI flow for adaptively positioning the lady in the game.
 *
 * This file exports a function `adaptiveLadyMovement` that determines the
 * next position of the lady based on the player's performance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the input of the adaptiveLadyMovement flow.
const LadyMovementInputSchema = z.object({
  canvasWidth: z.number().describe('The width of the game canvas.'),
  canvasHeight: z.number().describe('The height of the game canvas.'),
  imageWidth: z.number().describe('The width of the lady image.'),
  imageHeight: z.number().describe('The height of the lady image.'),
  consecutiveMisses: z.number().describe('Number of consecutive misses by the player.'),
});

// Define the schema for the output of the adaptiveLadyMovement flow.
const LadyMovementOutputSchema = z.object({
  x: z.number().describe('The new x-coordinate for the lady.'),
  y: z.number().describe('The new y-coordinate for the lady.'),
});

// Define the Genkit flow for adaptive lady movement.
const adaptiveLadyMovementFlow = ai.defineFlow(
  {
    name: 'adaptiveLadyMovementFlow',
    inputSchema: LadyMovementInputSchema,
    outputSchema: LadyMovementOutputSchema,
  },
  async (input) => {
    // If the player has missed 10 or more times, place the lady in the center.
    if (input.consecutiveMisses >= 10) {
      return {
        x: (input.canvasWidth - input.imageWidth) / 2,
        y: (input.canvasHeight - input.imageHeight) / 2,
      };
    }

    // Otherwise, place the lady at a random position within the canvas boundaries.
    const x = Math.random() * (input.canvasWidth - input.imageWidth);
    const y = Math.random() * (input.canvasHeight - input.imageHeight);

    return { x, y };
  }
);

/**
 * Determines the next position for the lady based on game state.
 * If the player has 10 or more consecutive misses, it provides a
 * predictable "pity" location. Otherwise, it returns a random position.
 *
 * @param input - The current state of the game canvas and player performance.
 * @returns A promise that resolves to the new coordinates for the lady.
 */
export async function adaptiveLadyMovement(
  input: z.infer<typeof LadyMovementInputSchema>
): Promise<z.infer<typeof LadyMovementOutputSchema>> {
  return await adaptiveLadyMovementFlow(input);
}
