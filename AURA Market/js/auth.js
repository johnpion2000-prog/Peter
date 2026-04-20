import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { showToast } from './utils.js';

const provider = new GoogleAuthProvider();

// ===== Create user doc in Firestore =====
async function createUserDoc(user, extraData = {}) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || extraData.name || '',
      email: user.email,
      address: '',
      cartItems: [],
      role: 'user',
      createdAt: serverTimestamp()
    });
  }
}

// ===== Sign Up =====
export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user, { name });
  return cred.user;
}

// ===== Sign In =====
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ===== Google Sign In =====
export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, provider);
  await createUserDoc(cred.user);
  return cred.user;
}

// ===== Password Reset =====
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ===== Sign Out =====
export async function logout() {
  await signOut(auth);
  localStorage.removeItem('pfm_cart');
  window.location.href = 'signin.html';
}

// ===== Auth state observer =====
export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ===== Get current user role =====
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data().role : 'user';
}

// ===== Initialize navbar auth state =====
export function initNavAuth() {
  onAuthStateChanged(auth, async (user) => {
    const loginLink = document.getElementById('nav-login');
    const userLink = document.getElementById('nav-user');
    const adminLink = document.getElementById('nav-admin');
    const logoutBtn = document.getElementById('nav-logout');

    if (user) {
      if (loginLink) loginLink.style.display = 'none';
      if (userLink) {
        userLink.style.display = 'flex';
        userLink.textContent = '👤 ' + (user.displayName || user.email.split('@')[0]);
      }
      const role = await getUserRole(user.uid);
      if (adminLink && role === 'admin') adminLink.style.display = 'flex';
      if (logoutBtn) logoutBtn.style.display = 'flex';
    } else {
      if (loginLink) loginLink.style.display = 'flex';
      if (userLink) userLink.style.display = 'none';
      if (adminLink) adminLink.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  });

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}
