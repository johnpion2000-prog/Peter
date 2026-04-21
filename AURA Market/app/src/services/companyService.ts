import { useState, useEffect } from 'react';
import {
  onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc,
  getDocs, query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { companiesCol } from '../firebase/collections';
import { db } from '../firebase/config';
import { slugify } from '../utils/slugify';
import type { Company, CompanyFormData, CompanyStatus } from '../types/company.types';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // No orderBy — Firestore skips docs without that field.
  // Fetch ALL, sort client-side so every company always appears.
  useEffect(() => {
    const unsub = onSnapshot(companiesCol, snap => {
      const list = snap.docs
        .map(d => ({ ...d.data(), id: d.id } as Company))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
      setCompanies(list);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return { companies, loading };
}

export async function createCompany(data: CompanyFormData): Promise<string> {
  const ref = await addDoc(companiesCol, {
    name: data.name,
    slug: slugify(data.name),
    email: data.email,
    ownerEmail: data.ownerEmail,
    ownerId: '',
    description: data.description ?? '',
    status: 'pending' as CompanyStatus,
    permissions: {
      canAddProducts: true,
      canManageOrders: data.canManageOrders,
      maxProducts: data.maxProducts,
      discountLimit: data.discountLimit,
    },
    productCount: 0,
    createdAt: serverTimestamp(),
    ...(data.expiresAt ? { expiresAt: Timestamp.fromDate(new Date(data.expiresAt)) } : {}),
  } as Omit<Company, 'id'>);
  return ref.id;
}

export async function updateCompany(id: string, data: Partial<CompanyFormData>): Promise<void> {
  await updateDoc(doc(db, 'companies', id), {
    ...(data.name && { name: data.name, slug: slugify(data.name) }),
    ...(data.email && { email: data.email }),
    ...(data.description !== undefined && { description: data.description }),
    permissions: {
      canAddProducts: true,
      canManageOrders: data.canManageOrders ?? true,
      maxProducts: data.maxProducts ?? 100,
      discountLimit: data.discountLimit ?? 50,
    },
    ...(data.expiresAt ? { expiresAt: Timestamp.fromDate(new Date(data.expiresAt)) } : {}),
  });
}

export async function setCompanyStatus(id: string, status: CompanyStatus): Promise<void> {
  const update: Record<string, unknown> = { status };
  // When activating a company that came in via vendor self-application,
  // permissions are all false/zero — enable them so the vendor can actually sell.
  if (status === 'active') {
    const snap = await getDoc(doc(db, 'companies', id));
    if (snap.exists()) {
      const c = snap.data() as Company;
      if (!c.permissions.canAddProducts) {
        update['permissions.canAddProducts']  = true;
        update['permissions.canManageOrders'] = true;
        if (!c.permissions.maxProducts)   update['permissions.maxProducts']  = 50;
        if (!c.permissions.discountLimit) update['permissions.discountLimit'] = 30;
      }
    }
  }
  await updateDoc(doc(db, 'companies', id), update);
}

export async function deleteCompany(id: string): Promise<void> {
  await deleteDoc(doc(db, 'companies', id));
}

export async function getCompany(id: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, 'companies', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Company) : null;
}

export async function applyAsVendor(
  uid: string,
  email: string,
  data: { companyName: string; companyEmail: string; description: string },
): Promise<string> {
  const ref = await addDoc(companiesCol, {
    name:        data.companyName,
    slug:        slugify(data.companyName),
    email:       data.companyEmail || email,
    ownerEmail:  email,
    ownerId:     uid,
    description: data.description,
    status:      'pending' as CompanyStatus,
    permissions: {
      canAddProducts:  false,
      canManageOrders: false,
      maxProducts:     0,
      discountLimit:   0,
    },
    productCount: 0,
    createdAt:    serverTimestamp(),
  } as Omit<Company, 'id'>);
  return ref.id;
}

/** Find a company by its URL slug. Returns null if not found. */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const q = query(companiesCol, where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const { id: _id, ...rest } = d.data() as Company;
  return { id: d.id, ...rest } as Company;
}

/**
 * Backfill: generate a slug for every company that is missing one.
 * Returns the number of companies updated.
 */
export async function backfillCompanySlugs(): Promise<number> {
  const snap = await getDocs(companiesCol);
  const missing = snap.docs.filter(d => !(d.data() as Company).slug);
  await Promise.all(
    missing.map(d =>
      updateDoc(doc(db, 'companies', d.id), {
        slug: slugify((d.data() as Company).name),
      }),
    ),
  );
  return missing.length;
}