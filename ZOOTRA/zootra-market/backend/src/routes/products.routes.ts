import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { validateProduct } from '../validators/product.validator';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Create a new product
router.post('/', authMiddleware, validateProduct, createProduct);

// Get all products
router.get('/', getProducts);

// Get a product by ID
router.get('/:id', getProductById);

// Update a product by ID
router.put('/:id', authMiddleware, validateProduct, updateProduct);

// Delete a product by ID
router.delete('/:id', authMiddleware, deleteProduct);

export const productsRoutes = router;
export default router;