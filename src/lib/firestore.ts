
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const updateUserScore = async (userId: string, scoreGained: number) => {
  if (!userId || scoreGained <= 0) return;
  const playerDocRef = doc(db, 'players', userId);
  try {
    await updateDoc(playerDocRef, {
      score: increment(scoreGained),
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
