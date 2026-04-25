// Get provider/company permissions (array of strings)
export const getProviderPermissions = async (uid: string): Promise<string[]> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.permissions) ? data.permissions : [];
};
import { getDocs, getDoc, updateDoc, doc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { usersCol, db } from '../firebase/collections';
import { AppUser } from '../types/user.types';

export const createUserProfile = async (user: Omit<AppUser, 'createdAt'>): Promise<void> => {
  await setDoc(doc(db, 'users', user.uid), {
    ...user,
    role: user.role ?? 'customer',
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  // Always merge the doc id as uid so partial docs (e.g. admin set via REST) work correctly
  return snap.exists() ? ({ ...snap.data(), uid: snap.id } as AppUser) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<AppUser>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data as any);
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  const snap = await getDocs(query(usersCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id }) as AppUser);
};
