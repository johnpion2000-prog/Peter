import { Request, Response } from 'express';
import { servicesCollection } from '../models/Service.model';

export const createService = async (req: Request, res: Response) => {
    try {
        const service = {
            userId: req.body.userId,
            serviceType: req.body.serviceType,
            description: req.body.description,
            price: req.body.price,
            availability: req.body.availability || {},
            isVerified: false,
            status: 'pending',
            createdAt: new Date(),
        };
        const ref = await servicesCollection.add(service);
        res.status(201).json({ id: ref.id, ...service });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getServices = async (req: Request, res: Response) => {
    try {
        const snapshot = await servicesCollection.get();
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(services);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getServiceById = async (req: Request, res: Response) => {
    try {
        const doc = await servicesCollection.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Service not found' });
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        const ref = servicesCollection.doc(req.params.id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Service not found' });
        await ref.update(req.body);
        const updated = await ref.get();
        res.status(200).json({ id: updated.id, ...updated.data() });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        const ref = servicesCollection.doc(req.params.id);
        const existing = await ref.get();
        if (!existing.exists) return res.status(404).json({ message: 'Service not found' });
        await ref.delete();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};