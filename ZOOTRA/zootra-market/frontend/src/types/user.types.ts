export type UserRole = 'admin' | 'customer' | 'farmer' | 'provider';

  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isApproved?: boolean; // For providers: admin approval
  isActive?: boolean; // For providers: admin activation status
  permissions?: string[]; // For providers: dashboard access control
  phone?: string;
  location?: string;
  photoURL?: string;
  createdAt?: string;
}

// Legacy alias
export type User = AppUser;

export type { AppUser };
