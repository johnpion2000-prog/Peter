import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usersCollection } from '../models/User.model';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const doc = await usersCollection.doc(decoded.id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'User not found.' });
        }

        (req as any).user = { id: doc.id, ...doc.data() };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid.' });
    }
};