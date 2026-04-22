import { Request, Response, NextFunction } from 'express';
import { usersCollection } from '../models/User.model';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const doc = await usersCollection.doc(userId).get();
        const user = doc.data() as any;

        if (!doc.exists || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};