import { Request, Response } from 'express';
import { usersCollection } from '../models/User.model';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map(doc => {
            const { password, ...data } = doc.data() as any;
            return { id: doc.id, ...data };
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const doc = await usersCollection.doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: 'User not found' });
        const { password, ...data } = doc.data() as any;
        res.status(200).json({ id: doc.id, ...data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const ref = await usersCollection.add({ ...req.body, createdAt: new Date() });
        res.status(201).json({ id: ref.id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = usersCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'User not found' });
        await ref.update(req.body);
        const updated = await ref.get();
        const { password, ...data } = updated.data() as any;
        res.status(200).json({ id: updated.id, ...data });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = usersCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'User not found' });
        await ref.delete();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};