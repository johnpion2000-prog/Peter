const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts — try again later.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed.',
  'auth/network-request-failed': 'Network error — check your connection.',
};

export function getAuthError(code: string): string {
  return AUTH_ERRORS[code] ?? 'An error occurred. Please try again.';
}

const FIRESTORE_ERRORS: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested document was not found.',
  'unavailable': 'Service temporarily unavailable. Try again.',
};

export function getFirestoreError(code: string): string {
  return FIRESTORE_ERRORS[code] ?? 'Database error. Please try again.';
}
