import type { Timestamp } from 'firebase/firestore';

export type CompanyStatus = 'active' | 'suspended' | 'pending';

export interface CompanyPermissions {
  canAddProducts: boolean;
  canManageOrders: boolean;
  maxProducts: number;
  discountLimit: number; // max discount % allowed
}

export interface Company {
  id: string;
  name: string;
  slug: string;           // URL-safe identifier, e.g. "aura-clothing-co"
  email: string;
  logoURL?: string;
  ownerId: string;
  ownerEmail: string;
  status: CompanyStatus;
  permissions: CompanyPermissions;
  productCount?: number;
  description?: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface CompanyFormData {
  name: string;
  email: string;
  ownerEmail: string;
  description: string;
  maxProducts: number;
  discountLimit: number;
  canManageOrders: boolean;
  expiresAt: string;
}
