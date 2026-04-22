// One-off script to promote a user to admin by updating Firestore via REST API
// Uses the Firebase project's API key (public) + Firestore REST API

import https from 'https';

const PROJECT_ID = 'zootra-61405';
const TARGET_UID = 'EqGzKhPupON8m5mMGlzyMJuEPWL2';

const body = JSON.stringify({
  fields: {
    role: { stringValue: 'admin' }
  }
});

// Use Firebase CLI auth token if available, otherwise try the REST API with no auth
// Firestore rules may need to allow this — we'll try with the API key approach
const options = {
  hostname: 'firestore.googleapis.com',
  path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${TARGET_UID}?updateMask.fieldPaths=role`,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Success! User promoted to admin.');
      console.log(JSON.parse(data).fields?.role);
    } else {
      console.log(`❌ Failed (${res.statusCode}):`, data);
      console.log('\nFirestore rules are blocking unauthenticated writes.');
      console.log('Use Firebase Console instead:');
      console.log(`https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/users/${TARGET_UID}`);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(body);
req.end();
