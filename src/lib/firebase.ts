
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleAuthProvider: GoogleAuthProvider;

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    // This check is crucial for the Vercel build process.
    // If the keys are not available during the build, we don't initialize.
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API key is not set. Please check your environment variables.");
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}


export function getFirebaseAuth() {
  if (!auth) {
    const app = getFirebaseApp();
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    const app = getFirebaseApp();
    db = getFirestore(app);
  }
  return db;
}

export function getGoogleAuthProvider() {
    if (!googleAuthProvider) {
        getFirebaseApp(); // ensures app is initialized
        googleAuthProvider = new GoogleAuthProvider();
    }
    return googleAuthProvider;
}
