import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from 'firebase/auth';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const firebaseConfig: FirebaseConfig | null = process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  ? {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    }
  : null;

export const isFirebaseConfigured = () =>
  Boolean(
    firebaseConfig?.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured() && firebaseConfig) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { app as firebaseApp, auth as firebaseAuth };

export type FirebaseUser = User;

export const onFirebaseAuthStateChanged = (
  callback: Parameters<typeof onAuthStateChanged>[1]
) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

export async function signInWithFirebase(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithFirebase(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutFirebase() {
  if (!auth) return;
  await firebaseSignOut(auth);
}
