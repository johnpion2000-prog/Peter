import {
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp, DocumentReference,
} from 'firebase/firestore';
import { productsCol, db } from '../firebase/collections';
import { Product, ProductCategory } from '../types/product.types';
import { calculateDiscountedPrice } from '../utils/calculateDiscount';

export const getAllProducts = async (): Promise<Product[]> => {
  const snap = await getDocs(query(productsCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Product);
};

export const getProductsByCategory = async (category: ProductCategory): Promise<Product[]> => {
  const snap = await getDocs(query(productsCol, where('category', '==', category)));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Product);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as Product) : null;
};

export const createProduct = async (
  data: Omit<Product, 'id' | 'discountedPrice' | 'createdAt'>
): Promise<string> => {
  const discountedPrice = calculateDiscountedPrice(data.price, data.discountPercent);
  const ref = await addDoc(productsCol, {
    ...data,
    discountedPrice,
    createdAt: serverTimestamp(),
  } as any);
  return ref.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<void> => {
  const updates: any = { ...data, updatedAt: serverTimestamp() };
  if (data.price !== undefined || data.discountPercent !== undefined) {
    const current = await getProductById(id);
    const price = data.price ?? current?.price ?? 0;
    const discountPercent = data.discountPercent ?? current?.discountPercent ?? 0;
    updates.discountedPrice = calculateDiscountedPrice(price, discountPercent);
  }
  await updateDoc(doc(db, 'products', id), updates);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
};
