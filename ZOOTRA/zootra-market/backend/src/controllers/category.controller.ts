import { Request, Response } from 'express';
import { categoriesCollection } from '../models/Category.model';

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const snapshot = await categoriesCollection.orderBy('sortOrder').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

export const getCategories = getAllCategories;

export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const doc = await categoriesCollection.doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error });
    }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
    const { name, parentId = null, sortOrder = 0 } = req.body;
    try {
        const ref = await categoriesCollection.add({ name, parentId, sortOrder, createdAt: new Date() });
        res.status(201).json({ id: ref.id, name, parentId, sortOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = categoriesCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Category not found' });
        await ref.update(req.body);
        const updated = await ref.get();
        res.status(200).json({ id: updated.id, ...updated.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const ref = categoriesCollection.doc(id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Category not found' });
        await ref.delete();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};