import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const updateUserScore = async (userId: string, newScore: number) => {
  if (!userId) return;
  const playerDocRef = doc(db, 'players', userId);
  try {
    // To prevent race conditions or incorrect calculations, 
    // it's better to fetch the latest score and add to it,
    // or use Firestore's atomic `increment`. However, since the new
    // total is calculated on the client, we'll just set it.
    await updateDoc(playerDocRef, {
      score: newScore,
    });
  } catch (error) {
    console.error("Error updating score: ", error);
  }
};
