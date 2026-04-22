import { db } from "./firebase.config";

// Re-export Firestore db instance as the primary database connection.
// All Firestore collection references are defined here for a single source of truth.

export const collections = {
  users: "users",
  products: "products",
  services: "services",
  bookings: "bookings",
  categories: "categories",
  messages: "messages",
  reviews: "reviews",
  whatsappLogs: "whatsapp_logs",
} as const;

export { db };
