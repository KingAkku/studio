
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

// This function ensures that we initialize the app only once.
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function getFirebaseApp() {
  if (app) return app;

  if (getApps().length > 0) {
    app = getApp();
  } else {
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API key is not set. Please check your environment variables.");
    }
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth() {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

export function getFirebaseDb() {
  if (db) return db;
  db = getFirestore(getFirebaseApp());
  return db;
}
