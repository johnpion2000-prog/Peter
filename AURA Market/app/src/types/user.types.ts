import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'superAdmin' | 'companyAdmin' | 'customer';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId?: string;
  address?: string;
  phone?: string;
  photoURL?: string;
  createdAt: Timestamp;
}
