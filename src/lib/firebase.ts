
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// This function ensures that we initialize the app only once.
const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length === 0) {
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API key is not set. Please check your environment variables.");
    }
    const app = initializeApp(firebaseConfig);
    // Conditionally add measurementId if it exists to avoid errors.
    if (firebaseConfig.measurementId) {
        app.options.measurementId = firebaseConfig.measurementId;
    }
    return app;
  }
  return getApp();
};

let auth: Auth;
let db: Firestore;
let googleAuthProvider: GoogleAuthProvider;

export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getGoogleAuthProvider() {
    if (!googleAuthProvider) {
        googleAuthProvider = new GoogleAuthProvider();
    }
    return googleAuthProvider;
}
