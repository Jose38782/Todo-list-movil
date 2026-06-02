import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  backendLoginWithFirebaseToken,
  clearAuthToken,
  getCurrentBackendUser,
} from '../services/api';
import {
  isFirebaseConfigured,
  onFirebaseAuthStateChanged,
  registerWithFirebase,
  signInWithFirebase,
  signOutFirebase,
  type FirebaseUser,
} from '../services/firebase';

type BackendSession = {
  id: string;
  email: string;
  firebaseUid: string;
  isActive: boolean;
};

type AuthState = {
  user: FirebaseUser | null;
  backendUser: BackendSession | null;
  isReady: boolean;
  isFirebase: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
const TOKEN_STORAGE_KEY = 'auth_token';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const storedBackendUser = await getCurrentBackendUser();
      if (storedBackendUser) {
        setBackendUser({
          id: storedBackendUser.id,
          email: storedBackendUser.email,
          firebaseUid: storedBackendUser.firebaseUid,
          isActive: storedBackendUser.isActive,
        });
      }
    };

    hydrate().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      const hydrateFallbackSession = async () => {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        setUser(token ? ({ uid: 'backend-session' } as FirebaseUser) : null);
        setIsReady(true);
      };

      hydrateFallbackSession().catch(() => {
        setIsReady(true);
      });

      return;
    }

    const unsubscribe = onFirebaseAuthStateChanged(async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        const token = await nextUser.getIdToken();
        const backendSession = await backendLoginWithFirebaseToken(token);
        setBackendUser({
          id: backendSession.id,
          email: backendSession.email,
          firebaseUid: backendSession.firebaseUid,
          isActive: backendSession.isActive,
        });
      } else {
        setBackendUser(null);
      }

      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      backendUser,
      isReady,
      isFirebase: isFirebaseConfigured(),
      signIn: async (email, password) => {
        if (isFirebaseConfigured()) {
          const credential = await signInWithFirebase(email, password);
          const token = await credential.user.getIdToken();
          const backendSession = await backendLoginWithFirebaseToken(token);
          setBackendUser({
            id: backendSession.id,
            email: backendSession.email,
            firebaseUid: backendSession.firebaseUid,
            isActive: backendSession.isActive,
          });
          setUser(credential.user);
          return;
        }

        throw new Error('Firebase authentication is required for this app.');
      },
      signUp: async (_name, email, password) => {
        if (isFirebaseConfigured()) {
          const credential = await registerWithFirebase(email, password);
          const token = await credential.user.getIdToken();
          const backendSession = await backendLoginWithFirebaseToken(token);
          setBackendUser({
            id: backendSession.id,
            email: backendSession.email,
            firebaseUid: backendSession.firebaseUid,
            isActive: backendSession.isActive,
          });
          setUser(credential.user);
          return;
        }

        throw new Error('Firebase authentication is required for this app.');
      },
      signOut: async () => {
        await signOutFirebase();
        await clearAuthToken();
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setBackendUser(null);
      },
    }),
    [user, backendUser, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
