import { db, auth } from './firebase-config.js';
import {
  collection, addDoc, doc, updateDoc, serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getCart, saveCart, showToast } from './utils.js';
import { onAuth } from './auth.js';

// ===== Place Order =====
export async function placeOrder({ name, address, phone }) {
  const user = auth.currentUser;
  if (!user) { window.location.href = 'signin.html'; return; }

  const cart = getCart();
  if (cart.length === 0) { showToast('Your cart is empty', 'error'); return; }

  const total = parseFloat(localStorage.getItem('pfm_cart_total') || '0') ||
    cart.reduce((s, i) => s + (i.discountedPrice || i.price) * i.qty, 0);

  const products = cart.map(i => ({
    productId: i.id,
    productName: i.productName,
    qty: i.qty,
    price: parseFloat(i.discountedPrice || i.price)
  }));

  const orderRef = await addDoc(collection(db, 'orders'), {
    userId: user.uid,
    userName: name,
    userAddress: address,
    userPhone: phone,
    products,
    totalAmount: parseFloat(total.toFixed(2)),
    status: 'pending',
    orderDate: serverTimestamp()
  });

  // Reduce stock for each product
  for (const item of cart) {
    try {
      await updateDoc(doc(db, 'products', item.id), {
        stock: increment(-item.qty)
      });
    } catch (_) {}
  }

  // Clear cart
  saveCart([]);
  localStorage.removeItem('pfm_cart_total');
  localStorage.removeItem('pfm_promo_discount');

  return orderRef.id;
}

// ===== Require auth guard — redirect if not logged in =====
export function requireAuth(redirectTo = 'signin.html') {
  return new Promise((resolve) => {
    onAuth((user) => {
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

// ===== Require admin guard =====
export async function requireAdmin() {
  const { getUserRole } = await import('./auth.js');
  return new Promise((resolve) => {
    onAuth(async (user) => {
      if (!user) { window.location.href = 'signin.html'; return; }
      const role = await getUserRole(user.uid);
      if (role !== 'admin') { window.location.href = 'index.html'; return; }
      resolve(user);
    });
  });
}
