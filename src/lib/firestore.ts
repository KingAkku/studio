import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const updateUserScore = async (userId: string, newScore: number) => {
  if (!userId) return;
  const playerDocRef = doc(db, 'players', userId);
  try {
    await updateDoc(playerDocRef, {
      score: newScore,
    });
  } catch (error) {
    console.error("Error updating score: ", error);
  }
};
