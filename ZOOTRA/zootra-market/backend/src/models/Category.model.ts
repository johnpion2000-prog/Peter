import { db } from '../config/database.config';

export interface ICategory {
  id?: string;
  name: string;
  parentId?: string | null;
  sortOrder?: number;
  createdAt?: Date;
}

export const categoriesCollection = db.collection('categories');