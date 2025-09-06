
import { doc, setDoc, increment } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export const updateUserScore = async (userId: string, scoreGained: number) => {
  if (!userId || scoreGained <= 0) return;
  const db = getFirebaseDb();
  const playerDocRef = doc(db, 'players', userId);
  try {
    // Use setDoc with merge: true to create or update the document.
    // The increment() function will atomically increase the score.
    await setDoc(playerDocRef, {
      score: increment(scoreGained),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating score: ", error);
  }
};

export const updatePlayerName = async (userId: string, newName: string) => {
  if (!userId || !newName) return;
  const db = getFirebaseDb();
  const playerDocRef = doc(db, 'players', userId);
  try {
    // Use setDoc with merge: true to create or update the document.
    await setDoc(playerDocRef, {
      name: newName,
    }, { merge: true });
  } catch (error) {
    console.error("Error updating player name: ", error);
  }
};
