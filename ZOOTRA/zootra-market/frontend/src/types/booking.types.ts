import { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ServiceType =
  | 'vet'
  | 'groomer'
  | 'trainer'
  | 'consultant'
  | 'transport';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  vet: 'Veterinary',
  groomer: 'Pet Grooming',
  trainer: 'Animal Training',
  consultant: 'Farm Consultation',
  transport: 'Animal Transport',
};

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceType: ServiceType;
  animalDescription: string;
  preferredDate: string;   // ISO date string "YYYY-MM-DD"
  preferredTime: string;   // e.g. "09:00"
  location: string;
  notes: string;
  status: BookingStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
