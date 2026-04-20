import type { ProductCategory } from '../types/product.types';

export const CATEGORIES: { value: ProductCategory; label: string; emoji: string }[] = [
  { value: 'fashion',     label: 'Fashion',     emoji: '👗' },
  { value: 'shoes',       label: 'Footwear',    emoji: '👟' },
  { value: 'automotive',  label: 'Automotive',  emoji: '🚗' },
  { value: 'electronics', label: 'Electronics', emoji: '💻' },
  { value: 'home',        label: 'Home',        emoji: '🏠' },
  { value: 'sports',      label: 'Sports',      emoji: '⚽' },
  { value: 'beauty',      label: 'Beauty',      emoji: '💄' },
  { value: 'food',        label: 'Food',        emoji: '🛒' },
  { value: 'other',       label: 'Other',       emoji: '📦' },
];

export const CATEGORY_EMOJI: Record<string, string> = {
  fashion: '👗', shoes: '👟', automotive: '🚗', electronics: '💻',
  home: '🏠', sports: '⚽', beauty: '💄', food: '🛒', other: '📦',
};

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  paid:      'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const MAX_IMAGE_SIZE_MB = 5;
