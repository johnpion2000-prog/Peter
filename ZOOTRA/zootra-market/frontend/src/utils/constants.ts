import { ProductCategory } from '../types/product.types';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'livestock', label: 'Livestock Products' },
  { value: 'feed',      label: 'Animal Feed' },
  { value: 'pet',       label: 'Pet Products' },
  { value: 'health',    label: 'Animal Health' },
  { value: 'other',     label: 'Other' },
];

export const MAX_DISCOUNT_PERCENT = 80;
export const MAX_IMAGE_SIZE_MB = 5;
export const WHATSAPP_NUMBER = '+250700000000';
