import { Router } from 'express';
import { 
    createCategory, 
    getCategories, 
    getCategoryById, 
    updateCategory, 
    deleteCategory 
} from '../controllers/category.controller';

const router = Router();

// Route to create a new category
router.post('/', createCategory);

// Route to get all categories
router.get('/', getCategories);

// Route to get a category by ID
router.get('/:id', getCategoryById);

// Route to update a category by ID
router.put('/:id', updateCategory);

// Route to delete a category by ID
router.delete('/:id', deleteCategory);

export const categoriesRoutes = router;
export default router;