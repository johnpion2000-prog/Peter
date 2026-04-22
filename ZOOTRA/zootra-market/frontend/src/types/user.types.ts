export type UserRole = 'admin' | 'customer' | 'farmer' | 'provider';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  location?: string;
  photoURL?: string;
  createdAt?: string;
}

// Legacy alias
export type User = AppUser;
