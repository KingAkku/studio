
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

function initializeFirebase() {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey) {
      // This check is crucial for the Vercel build process.
      // If the keys are not available during the build, we don't initialize.
      // The client-side will have the env vars and will initialize correctly.
      return;
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleAuthProvider = new GoogleAuthProvider();
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleAuthProvider = new GoogleAuthProvider();
  }
}

// Call the function to initialize Firebase services.
initializeFirebase();

export function getFirebaseAuth() {
  if (!auth) {
    initializeFirebase(); // Re-initialize if it wasn't available (e.g., server build)
  }
  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

export function getGoogleAuthProvider() {
    if (!googleAuthProvider) {
        initializeFirebase();
    }
    return googleAuthProvider;
}
