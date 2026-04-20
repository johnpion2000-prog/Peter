# PetFoodMarket 🐾

A full-featured pet food e-commerce web app powered by **Firebase**.

## File Structure

```
├── index.html              Homepage (hero, featured products, deals)
├── products.html           Product listing with filters & search
├── product-detail.html     Single product page
├── cart.html               Shopping cart with promo codes
├── checkout.html           Checkout & order placement
├── signin.html             Sign in (Email + Google)
├── signup.html             Create account
├── reset-password.html     Password reset
├── admin.html              Admin panel (add/edit/delete products, orders)
├── css/
│   └── style.css           Full stylesheet
├── js/
│   ├── firebase-config.js  Firebase app initialization
│   ├── auth.js             Auth functions (signUp, signIn, Google, logout)
│   ├── utils.js            Cart helpers, toast, formatPrice
│   ├── products.js         Firestore product fetching & card rendering
│   ├── cart.js             Cart render & promo code logic
│   ├── checkout.js         Order placement & route guards
│   └── admin.js            Admin CRUD for products & orders
├── firestore.rules         Firestore security rules
├── storage.rules           Firebase Storage security rules
└── firebase.json           Firebase Hosting + services config
```

## Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project named **PetFoodMarket**
3. Enable: **Authentication**, **Firestore**, **Storage**, **Hosting**

### 2. Authentication Providers
- Enable **Email/Password**
- Enable **Google**

### 3. Add Firebase Config
Open `js/firebase-config.js` and replace the placeholder values with your project's config (Project Settings → Your apps → Web app):

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Set Up Admin User
After signing up, go to Firestore Console → `users` collection → find your user document → change `role` from `"user"` to `"admin"`.

### 5. Deploy Security Rules
```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use --add YOUR_PROJECT_ID
npx -y firebase-tools@latest deploy --only firestore:rules,storage:rules
```

### 6. Deploy to Firebase Hosting (optional)
```bash
npx -y firebase-tools@latest deploy --only hosting
```

## Firestore Collections

| Collection   | Purpose                              |
|-------------|--------------------------------------|
| `users`      | User profiles & roles                |
| `products`   | Product catalog                      |
| `orders`     | Customer orders                      |
| `discounts`  | Promo codes (optional)               |

## Adding a Promo Code (Firestore Console)
Add a document to the `discounts` collection:
```json
{
  "code": "PETLOVE",
  "discountPercent": 10,
  "validUntil": <Timestamp for future date>
}
```
