// ===== Toast Notifications =====
export function showToast(message, type = 'default') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ===== Cart Count Badge =====
export function updateCartBadge(count) {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

// ===== Get Cart from localStorage =====
export function getCart() {
  return JSON.parse(localStorage.getItem('pfm_cart') || '[]');
}

export function saveCart(cart) {
  localStorage.setItem('pfm_cart', JSON.stringify(cart));
  updateCartBadge(cart.reduce((s, i) => s + i.qty, 0));
}

export function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showToast(`${product.productName} added to cart!`, 'success');
}

// ===== Initialize cart badge on page load =====
document.addEventListener('DOMContentLoaded', () => {
  const cart = getCart();
  updateCartBadge(cart.reduce((s, i) => s + i.qty, 0));
});

// ===== Category emoji helper =====
export function categoryEmoji(cat) {
  const map = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐇', other: '🐾' };
  return map[cat] || '🐾';
}

// ===== Format currency =====
export function formatPrice(n) {
  return 'RWF\u00a0' + Math.round(parseFloat(n)).toLocaleString('en-US');
}
