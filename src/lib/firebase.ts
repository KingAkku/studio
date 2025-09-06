
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    // During server-side rendering or build, do not initialize
    return;
  }

  if (!app) {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      if (!firebaseConfig.apiKey) {
        throw new Error("Firebase API key is not set. Please check your environment variables.");
      }
      app = initializeApp(firebaseConfig);
    }
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

// Call initialization on load (in the browser)
initializeFirebase();

export function getFirebaseAuth() {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
}

export function getFirebaseDb() {
  if (!db) {
    initializeFirebase();
  }
  return db!;
}
