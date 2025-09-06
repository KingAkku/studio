
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This function ensures that we initialize the app only once.
function initializeFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  // Check if the API key is provided. This is crucial for client-side rendering.
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API key is not set. Please check your environment variables.");
  }
  
  const newApp = initializeApp(firebaseConfig);

  return newApp;
}

// Initialize the app
app = initializeFirebaseApp();
auth = getAuth(app);
db = getFirestore(app);


export function getFirebaseAuth() {
  return auth;
}

export function getFirebaseDb() {
  return db;
}
