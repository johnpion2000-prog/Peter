import { db } from './firebase-config.js';
import { auth } from './firebase-config.js';
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getCart, saveCart, formatPrice, showToast, categoryEmoji } from './utils.js';

// ===== Render Cart Page =====
export function renderCart() {
  const cart = getCart();
  const itemsContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('summary-subtotal');
  const discountEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:20px">Shop Now</a>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = 'RWF\u00a00';
    if (discountEl) discountEl.textContent = '-RWF\u00a00';
    if (totalEl) totalEl.textContent = 'RWF\u00a00';
    return;
  }

  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.productName}">` : categoryEmoji(item.category)}
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.productName}</p>
        <p class="cart-item-price">${formatPrice(item.discountedPrice || item.price)}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="window._cartQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="window._cartQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="window._cartRemove('${item.id}')" title="Remove">🗑</button>
    </div>`).join('');

  updateCartSummary();
}

function updateCartSummary(promoDiscount = 0) {
  const cart = getCart();
  const subtotals = cart.map(i => (i.discountedPrice || i.price) * i.qty);
  const subtotal = subtotals.reduce((a, b) => a + b, 0);
  const promoAmount = subtotal * (promoDiscount / 100);
  const total = subtotal - promoAmount;

  const subtotalEl = document.getElementById('summary-subtotal');
  const discountEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (discountEl) discountEl.textContent = '-' + formatPrice(promoAmount);
  if (totalEl) totalEl.textContent = formatPrice(total);

  localStorage.setItem('pfm_promo_discount', promoDiscount);
  localStorage.setItem('pfm_cart_total', total.toFixed(2));
}

window._cartQty = function(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
};

window._cartRemove = function(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  showToast('Item removed from cart');
};

// ===== Apply Promo Code =====
export async function applyPromo(code) {
  const { getDocs, query, collection, where } = await import(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
  );
  const q = query(collection(db, 'discounts'), where('code', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) { showToast('Invalid promo code', 'error'); return; }

  const promo = snap.docs[0].data();
  const now = new Date();
  if (promo.validUntil.toDate() < now) { showToast('Promo code has expired', 'error'); return; }

  showToast(`Promo applied! ${promo.discountPercent}% off`, 'success');
  updateCartSummary(promo.discountPercent);
}
