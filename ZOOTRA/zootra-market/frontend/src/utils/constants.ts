import { ProductCategory } from '../types/product.types';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'goat', label: 'Goats' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'pig', label: 'Pigs' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'bird', label: 'Birds' },
  { value: 'rabbit', label: 'Rabbits' },
  { value: 'other', label: 'Other' },
];

export const MAX_DISCOUNT_PERCENT = 80;
export const MAX_IMAGE_SIZE_MB = 5;
export const WHATSAPP_NUMBER = '+250700000000';
