import { db } from '../config/database.config';

export interface IReview {
  id?: string;
  userId: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const reviewsCollection = db.collection('reviews');