import { db } from '../config/database.config';

export interface IUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'farmer' | 'provider' | 'admin' | 'buyer';
  isVerified: boolean;
  verificationDocument?: string;
  location: string;
  createdAt: Date;
}

export const usersCollection = db.collection('users');