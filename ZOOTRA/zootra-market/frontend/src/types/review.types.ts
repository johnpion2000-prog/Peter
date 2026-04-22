import { Timestamp } from 'firebase/firestore';

export type ReviewSubject = 'product' | 'service';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subjectType: ReviewSubject;
  subjectId: string;    // productId or bookingId
  subjectName: string;  // product name or service label
  rating: number;       // 1–5
  comment: string;
  createdAt: Timestamp;
}
