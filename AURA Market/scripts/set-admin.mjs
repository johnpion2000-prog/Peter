#!/usr/bin/env node
/**
 * set-admin.mjs
 * One-time script to promote a user to superAdmin in Firestore.
 * Uses firebase-admin with Application Default Credentials.
 *
 * Usage:
 *   node scripts/set-admin.mjs
 *
 * Requires ONE of:
 *   A) service-account.json in the project root (download from
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key)
 *   B) GOOGLE_APPLICATION_CREDENTIALS env var pointing to the JSON file
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

const PROJECT_ID = 'petfoodmarket-b323a';
const TARGET_UID = 'L1fXqQ9GJNS5SZMCfl5RIGvHXVr1';
const TARGET_ROLE = 'superAdmin';

// ── Init ──────────────────────────────────────────────────────────────────
const saPath = resolve(__dir, '../service-account.json');

if (existsSync(saPath)) {
  const sa = JSON.parse(readFileSync(saPath, 'utf8'));
  initializeApp({ credential: cert(sa), projectId: PROJECT_ID });
  console.log('🔑 Using service-account.json');
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const { applicationDefault } = await import('firebase-admin/app');
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  console.log('🔑 Using GOOGLE_APPLICATION_CREDENTIALS');
} else {
  console.error(`
❌  No credentials found.

Please do ONE of the following:

  Option A — Service account file (recommended)
  ─────────────────────────────────────────────
  1. Open https://console.firebase.google.com/project/petfoodmarket-b323a/settings/serviceaccounts/adminsdk
  2. Click "Generate new private key" → download the JSON
  3. Save it as:  service-account.json  (in the project root)
  4. Re-run:  node scripts/set-admin.mjs

  Option B — gcloud ADC
  ─────────────────────────────────────────────
  Run:  gcloud auth application-default login
  Then: node scripts/set-admin.mjs
`);
  process.exit(1);
}

// ── Write ─────────────────────────────────────────────────────────────────
const db = getFirestore();

const ref = db.collection('users').doc(TARGET_UID);
const snap = await ref.get();

if (snap.exists && snap.data()?.role === TARGET_ROLE) {
  console.log(`✅ Already ${TARGET_ROLE}: ${TARGET_UID}`);
  process.exit(0);
}

await ref.set({ role: TARGET_ROLE, uid: TARGET_UID }, { merge: true });

console.log(`✅ Success — user ${TARGET_UID} is now ${TARGET_ROLE}`);
console.log('   They can now access /admin in the app.');
process.exit(0);
