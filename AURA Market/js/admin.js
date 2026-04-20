import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, doc, updateDoc, deleteDoc, getDocs,
  query, orderBy, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { showToast } from './utils.js';

// ===== Upload image to Firebase Storage =====
export function uploadProductImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `product_images/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on('state_changed',
      (snap) => { if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)); },
      reject,
      async () => { resolve(await getDownloadURL(task.snapshot.ref)); }
    );
  });
}

// ===== Add Product =====
export async function addProduct(data, imageFile, onProgress) {
  let imageURL = '';
  if (imageFile) {
    imageURL = await uploadProductImage(imageFile, onProgress);
  }
  const discountedPrice = data.price - (data.price * data.discountPercent / 100);
  await addDoc(collection(db, 'products'), {
    productName: data.productName,
    category: data.category,
    price: parseFloat(data.price),
    discountPercent: parseFloat(data.discountPercent) || 0,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    imageURL,
    description: data.description || '',
    stock: parseInt(data.stock) || 0,
    createdAt: serverTimestamp()
  });
  showToast('Product added successfully!', 'success');
}

// ===== Update Product =====
export async function updateProduct(id, data, imageFile, onProgress) {
  let imageURL = data.imageURL || '';
  if (imageFile) {
    imageURL = await uploadProductImage(imageFile, onProgress);
  }
  const discountedPrice = data.price - (data.price * data.discountPercent / 100);
  await updateDoc(doc(db, 'products', id), {
    productName: data.productName,
    category: data.category,
    price: parseFloat(data.price),
    discountPercent: parseFloat(data.discountPercent) || 0,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    imageURL,
    description: data.description || '',
    stock: parseInt(data.stock) || 0
  });
  showToast('Product updated!', 'success');
}

// ===== Delete Product =====
export async function deleteProduct(id) {
  const snap = await getDoc(doc(db, 'products', id));
  if (snap.exists() && snap.data().imageURL) {
    try {
      const imgRef = ref(storage, snap.data().imageURL);
      await deleteObject(imgRef);
    } catch (_) {}
  }
  await deleteDoc(doc(db, 'products', id));
  showToast('Product deleted', 'success');
}

// ===== Fetch all orders =====
export async function fetchAllOrders() {
  const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ===== Update order status =====
export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, 'orders', orderId), { status });
  showToast(`Order marked as ${status}`, 'success');
}

// ===== Fetch stats =====
export async function fetchAdminStats() {
  const [products, orders, users] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'users'))
  ]);
  const totalRevenue = orders.docs.reduce((s, d) => s + (d.data().totalAmount || 0), 0);
  return {
    products: products.size,
    orders: orders.size,
    users: users.size,
    revenue: totalRevenue.toFixed(2)
  };
}
