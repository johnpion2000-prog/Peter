import { Request, Response } from 'express';
import { usersCollection } from '../models/User.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    try {
        const existing = await usersCollection.where('email', '==', email).limit(1).get();
        if (!existing.empty) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const ref = await usersCollection.add({
            name, email, phone,
            password: hashedPassword,
            role: 'farmer',
            isVerified: false,
            location: 'Kigali',
            createdAt: new Date(),
        });
        res.status(201).json({ message: 'User registered successfully', id: ref.id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ message: 'User not found' });

        const userDoc = snapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() } as any;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const doc = await usersCollection.doc((req as any).user.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'User not found' });
        const { password, ...profile } = doc.data() as any;
        res.status(200).json({ id: doc.id, ...profile });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};