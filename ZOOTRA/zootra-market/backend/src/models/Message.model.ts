import { db } from '../config/database.config';

export interface IMessage {
  id?: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  timestamp: Date;
}

export const messagesCollection = db.collection('messages');