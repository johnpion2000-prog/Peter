import { useState, useEffect } from 'react';
import {
  getDocs, query, where, orderBy, limit,
  doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { productsCol } from '../firebase/collections';
import { uploadImage, deleteImage } from '../firebase/storage';
import type { Product, ProductFormData, ProductCategory } from '../types/product.types';

interface FetchOptions {
  category?: ProductCategory | '';
  maxPrice?: number;
  onlyDiscount?: boolean;
  companyId?: string;
  searchTerm?: string;
  limitCount?: number;
}

export function useProducts(options: FetchOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(options)]); // eslint-disable-line

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      let q = query(productsCol, orderBy('createdAt', 'desc'));
      if (options.category) q = query(productsCol, where('category', '==', options.category), orderBy('createdAt', 'desc'));
      if (options.companyId) q = query(productsCol, where('companyId', '==', options.companyId), orderBy('createdAt', 'desc'));
      if (options.limitCount) q = query(q, limit(options.limitCount));

      const snap = await getDocs(q);
      let list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));

      if (options.onlyDiscount) list = list.filter(p => p.discountPercent > 0);
      if (options.maxPrice !== undefined) list = list.filter(p => p.price <= options.maxPrice!);
      if (options.searchTerm) {
        const lower = options.searchTerm.toLowerCase();
        list = list.filter(p => p.productName.toLowerCase().includes(lower));
      }

      setProducts(list);
    } catch (e) {
      setError('Failed to load products');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: fetchProducts };
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export async function createProduct(
  data: ProductFormData,
  companyId?: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  let imageURL = '';
  if (data.imageFile?.[0]) {
    imageURL = await uploadImage(
      data.imageFile[0],
      `product_images/${Date.now()}_${data.imageFile[0].name}`,
      onProgress
    );
  }
  const discountedPrice = parseFloat(
    (data.price - data.price * (data.discountPercent / 100)).toFixed(2)
  );
  await addDoc(productsCol, {
    productName: data.productName,
    category: data.category,
    price: data.price,
    discountPercent: data.discountPercent,
    discountedPrice,
    imageURL,
    description: data.description,
    stock: data.stock,
    ...(companyId ? { companyId } : {}),
    createdAt: serverTimestamp(),
  } as Omit<Product, 'id'>);

  // Increment company product count
  if (companyId) {
    await updateDoc(doc(db, 'companies', companyId), { productCount: increment(1) });
  }
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData> & { imageURL?: string },
  onProgress?: (pct: number) => void
): Promise<void> {
  let imageURL = data.imageURL ?? '';
  if (data.imageFile?.[0]) {
    imageURL = await uploadImage(
      data.imageFile[0],
      `product_images/${Date.now()}_${data.imageFile[0].name}`,
      onProgress
    );
  }
  const price = data.price ?? 0;
  const discountedPrice = parseFloat(
    (price - price * ((data.discountPercent ?? 0) / 100)).toFixed(2)
  );
  await updateDoc(doc(db, 'products', id), {
    ...(data.productName && { productName: data.productName }),
    ...(data.category && { category: data.category }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent, discountedPrice }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.stock !== undefined && { stock: data.stock }),
    imageURL,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const snap = await getDoc(doc(db, 'products', id));
  if (snap.exists()) {
    const url = snap.data().imageURL;
    if (url) await deleteImage(url);
    const companyId = snap.data().companyId;
    if (companyId) {
      await updateDoc(doc(db, 'companies', companyId), { productCount: increment(-1) });
    }
  }
  await deleteDoc(doc(db, 'products', id));
}
