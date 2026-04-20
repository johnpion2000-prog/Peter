import { db } from './firebase-config.js';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { addToCart, categoryEmoji, formatPrice, showToast } from './utils.js';

// ===== Build product card HTML =====
export function buildProductCard(id, data) {
  const hasDiscount = data.discountPercent > 0;
  const discounted = hasDiscount
    ? (data.price - (data.price * data.discountPercent / 100)).toFixed(2)
    : data.price;
  const imgHtml = data.imageURL
    ? `<img class="product-card-img" src="${data.imageURL}" alt="${data.productName}" loading="lazy">`
    : `<div class="product-card-img-placeholder">${categoryEmoji(data.category)}</div>`;

  return `
    <div class="product-card" data-id="${id}">
      <a href="product-detail.html?id=${id}">
        ${hasDiscount ? `<span class="discount-badge">-${data.discountPercent}%</span>` : ''}
        ${imgHtml}
      </a>
      <div class="product-card-body">
        <p class="product-category">${data.category}</p>
        <a href="product-detail.html?id=${id}">
          <p class="product-name">${data.productName}</p>
        </a>
        <div class="product-pricing">
          ${hasDiscount
            ? `<span class="product-price-original">${formatPrice(data.price)}</span>
               <span class="product-price-final">${formatPrice(discounted)}</span>`
            : `<span class="product-price-nodiscount">${formatPrice(data.price)}</span>`}
        </div>
        <button class="add-to-cart-btn" ${data.stock <= 0 ? 'disabled' : ''}
          onclick='window._addToCart(${JSON.stringify({ id, ...data, discountedPrice: discounted })})'>
          ${data.stock <= 0 ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>`;
}

// ===== Expose addToCart globally for inline onclick =====
window._addToCart = addToCart;

// ===== Fetch featured products (homepage) =====
export async function fetchFeaturedProducts(limitCount = 8) {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ===== Fetch products with optional filters =====
export async function fetchProducts({ category = '', maxPrice = 9999, onlyDiscount = false } = {}) {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  if (category) q = query(collection(db, 'products'), where('category', '==', category), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (onlyDiscount) products = products.filter(p => p.discountPercent > 0);
  products = products.filter(p => p.price <= maxPrice);
  return products;
}

// ===== Fetch single product =====
export async function fetchProduct(id) {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ===== Search products by name (client-side) =====
export async function searchProducts(term) {
  const snap = await getDocs(collection(db, 'products'));
  const lower = term.toLowerCase();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => p.productName.toLowerCase().includes(lower));
}

// ===== Render product grid into container =====
export function renderProducts(products, container) {
  if (!container) return;
  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different filter or check back later.</p>
      </div>`;
    return;
  }
  container.innerHTML = products.map(p => buildProductCard(p.id, p)).join('');
}
