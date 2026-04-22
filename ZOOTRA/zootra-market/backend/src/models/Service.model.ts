import { db } from '../config/database.config';

export interface IService {
  id?: string;
  userId: string;
  serviceType: 'vet' | 'groomer' | 'trainer' | 'consultant' | 'transport';
  description: string;
  price: number;
  availability: object;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
}

export const servicesCollection = db.collection('services');