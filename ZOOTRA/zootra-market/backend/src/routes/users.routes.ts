import { Router } from 'express';
import { 
    createUser, 
    getUserById, 
    updateUser, 
    deleteUser, 
    getAllUsers 
} from '../controllers/user.controller';
import { validateUser } from '../validators/user.validator';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route to create a new user
router.post('/', validateUser, createUser);

// Route to get all users
router.get('/', authMiddleware, getAllUsers);

// Route to get a user by ID
router.get('/:id', authMiddleware, getUserById);

// Route to update a user by ID
router.put('/:id', authMiddleware, validateUser, updateUser);

// Route to delete a user by ID
router.delete('/:id', authMiddleware, deleteUser);

export const usersRoutes = router;
export default router;