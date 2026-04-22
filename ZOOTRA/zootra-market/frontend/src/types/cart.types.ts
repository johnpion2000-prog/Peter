import { Product } from './product.types';

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}
