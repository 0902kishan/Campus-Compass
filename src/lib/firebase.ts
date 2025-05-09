// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Next.js automatically loads environment variables from .env.local (and other .env files)
// Especially for variables prefixed with NEXT_PUBLIC_, no explicit dotenv.config() is needed.

const storageBucketEnv = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!storageBucketEnv || storageBucketEnv.trim() === '') {
  console.error(
    "CRITICAL Firebase Initialization Error: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing or empty in your environment variables. " +
    "Firebase Storage operations (like image uploads) will fail. " +
    "Please ensure it is correctly set in your .env.local file. \n" +
    "Example: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com\n" +
    "You can find your storage bucket name in the Firebase Console under 'Storage' -> 'Files' (it usually looks like 'your-project-id.appspot.com').\n" +
    "After adding or correcting this value in .env.local, YOU MUST RESTART your Next.js development server."
  );
  // Note: If NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not defined or empty,
  // subsequent Firebase operations relying on it will fail.
  // For a hard stop in development, you could throw an error here:
  // if (process.env.NODE_ENV === 'development') {
  //   throw new Error("CRITICAL: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not configured. Check .env.local and restart the server.");
  // }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: storageBucketEnv, // Use the env variable
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
// The getStorage() call will fail if storageBucket is not correctly configured in firebaseConfig.
let storage;
try {
  storage = getStorage(app);
} catch (error) {
  console.error("Error initializing Firebase Storage. This is likely due to a missing or incorrect 'storageBucket' in your Firebase config or .env.local file.", error);
  // To prevent the app from crashing entirely if storage is optional, 
  // you might set storage to a mock/dummy object or handle its absence gracefully elsewhere.
  // For this app, storage is critical for image uploads.
  // throw error; // Or rethrow if storage is absolutely essential for the app to function.
}


export { app, db, storage };

// Ensure you have a .env.local file in the root of your project with your Firebase config:
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com  <-- MAKE SURE THIS IS SET CORRECTLY AND MATCHES YOUR FIREBASE CONSOLE
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
// NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

// IMPORTANT: After creating or updating .env.local, you MUST restart your Next.js development server.
