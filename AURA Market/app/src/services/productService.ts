import {
  getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc,
  query, where, orderBy, limit, serverTimestamp, increment,
} from 'firebase/firestore';
import { productsCol } from '../firebase/collections';
import { db } from '../firebase/config';
import { uploadImage, deleteImage } from '../firebase/storage';
import type { Product, ProductFormData } from '../types/product.types';

export async function fetchProducts(companyId?: string): Promise<Product[]> {
  const q = companyId
    ? query(productsCol, where('companyId', '==', companyId))
    : query(productsCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const products = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
  // Sort client-side when filtering by companyId to avoid needing a composite index
  if (companyId) {
    products.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  }
  return products;
}

export async function fetchFeaturedProducts(count = 8): Promise<Product[]> {
  const q = query(productsCol, orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export async function createProduct(
  data: ProductFormData,
  imageFile: File,
  companyId?: string,
): Promise<string> {
  const imageURL = await uploadImage(imageFile, `products/${Date.now()}_${imageFile.name}`);
  const discountedPrice = data.price * (1 - data.discountPercent / 100);
  const payload: Omit<Product, 'id'> = {
    productName: data.productName,
    category: data.category,
    price: data.price,
    discountPercent: data.discountPercent,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    imageURL,
    description: data.description,
    stock: data.stock,
    createdAt: serverTimestamp() as any,
    ...(companyId ? { companyId } : {}),
  };
  const ref = await addDoc(productsCol, payload);
  if (companyId) {
    const compDoc = doc(db, 'companies', companyId);
    await updateDoc(compDoc, { productCount: increment(1) });
  }
  return ref.id;
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>,
  newImageFile?: File,
  oldImageURL?: string,
): Promise<void> {
  let imageURL = oldImageURL;
  if (newImageFile) {
    if (oldImageURL) await deleteImage(oldImageURL);
    imageURL = await uploadImage(newImageFile, `products/${Date.now()}_${newImageFile.name}`);
  }
  const update: Record<string, unknown> = { ...data };
  if (imageURL) update.imageURL = imageURL;
  if (data.price !== undefined && data.discountPercent !== undefined) {
    update.discountedPrice = parseFloat(
      (data.price * (1 - data.discountPercent / 100)).toFixed(2),
    );
  }
  delete update.imageFile;
  await updateDoc(doc(db, 'products', id), update);
}

export async function deleteProduct(id: string, imageURL: string, companyId?: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
  if (imageURL) await deleteImage(imageURL);
  if (companyId) {
    await updateDoc(doc(db, 'companies', companyId), { productCount: increment(-1) });
  }
}
