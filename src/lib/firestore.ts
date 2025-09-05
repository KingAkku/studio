import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const updateUserScore = async (userId: string, newScore: number) => {
  if (!userId) return;
  const playerDocRef = doc(db, 'players', userId);
  try {
    // Firestore's atomic `increment` is best to avoid race conditions.
    // However, the game logic provides the total new score.
    // To use increment, we would pass the score delta instead.
    await updateDoc(playerDocRef, {
      score: newScore,
    });
  } catch (error) {
    console.error("Error updating score: ", error);
  }
};

export const updatePlayerName = async (userId: string, newName: string) => {
  if (!userId || !newName) return;
  const playerDocRef = doc(db, 'players', userId);
  try {
    await updateDoc(playerDocRef, {
      name: newName,
    });
  } catch (error) {
    console.error("Error updating player name: ", error);
  }
};
