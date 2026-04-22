import { Request, Response } from 'express';
import { productsCollection } from '../models/Product.model';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = {
            userId: req.body.userId,
            categoryId: req.body.categoryId,
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            images: req.body.images || [],
            status: 'pending',
            createdAt: new Date(),
        };
        const ref = await productsCollection.add(product);
        res.status(201).json({ id: ref.id, ...product });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const snapshot = await productsCollection.get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(products);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const doc = await productsCollection.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const ref = productsCollection.doc(req.params.id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Product not found' });
        await ref.update(req.body);
        const updated = await ref.get();
        res.status(200).json({ id: updated.id, ...updated.data() });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const ref = productsCollection.doc(req.params.id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Product not found' });
        await ref.delete();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};