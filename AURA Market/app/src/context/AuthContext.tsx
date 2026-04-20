import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { AppUser, UserRole } from '../types/user.types';

interface AuthContextType {
  currentUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  role: UserRole | null;
  signUp: (email: string, password: string, displayName: string) => Promise<string>;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signInWithGoogle: () => Promise<AppUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; phone?: string; address?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const googleProvider = new GoogleAuthProvider();

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}

async function ensureUserDoc(user: User, displayName?: string): Promise<AppUser> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const data: Omit<AppUser, 'id'> = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: displayName ?? user.displayName ?? '',
      role: 'customer',
      createdAt: serverTimestamp() as AppUser['createdAt'],
    };
    await setDoc(ref, data);
    return data as AppUser;
  }
  return snap.data() as AppUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            setAppUser(snap.data() as AppUser);
          } else {
            // Auth account exists but Firestore doc missing (e.g. sign-up partially failed)
            const userData = await ensureUserDoc(user);
            setAppUser(userData);
          }
        } catch {
          // Firestore unavailable — keep appUser null but don't block the app
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
  }, []);

  async function signUp(email: string, password: string, displayName: string): Promise<string> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    const userData = await ensureUserDoc(user, displayName);
    setAppUser(userData);
    return user.uid;
  }

  async function signIn(email: string, password: string): Promise<AppUser> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', user.uid));
    const userData = snap.exists() ? (snap.data() as AppUser) : await ensureUserDoc(user);
    setAppUser(userData);
    return userData;
  }

  async function signInWithGoogle(): Promise<AppUser> {
    const { user } = await signInWithPopup(auth, googleProvider);
    const userData = await ensureUserDoc(user);
    setAppUser(userData);
    return userData;
  }

  async function logout() {
    await signOut(auth);
    setAppUser(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(data: { displayName?: string; phone?: string; address?: string; photoURL?: string }): Promise<void> {
    if (!currentUser) throw new Error('Not authenticated');
    const ref = doc(db, 'users', currentUser.uid);
    // Only write defined fields
    const patch: Record<string, unknown> = {};
    if (data.displayName !== undefined) patch.displayName = data.displayName;
    if (data.phone       !== undefined) patch.phone       = data.phone;
    if (data.address     !== undefined) patch.address     = data.address;
    if (data.photoURL    !== undefined) patch.photoURL    = data.photoURL;
    await updateDoc(ref, patch);
    if (data.displayName) await updateProfile(currentUser, { displayName: data.displayName });
    if (data.photoURL)    await updateProfile(currentUser, { photoURL:     data.photoURL });
    const snap = await getDoc(ref);
    if (snap.exists()) setAppUser(snap.data() as AppUser);
  }

  const value: AuthContextType = {
    currentUser, appUser, loading,
    role: appUser?.role ?? null,
    signUp, signIn, signInWithGoogle, logout, resetPassword, updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
