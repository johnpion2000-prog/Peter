import { Request, Response } from 'express';
import { getAnalyticsData as fetchAnalyticsData } from '../services/analytics.service';

export const getAnalyticsOverview = async (req: Request, res: Response) => {
    try {
        const analyticsData = await fetchAnalyticsData();
        res.status(200).json(analyticsData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving analytics data', error });
    }
};

// Alias used by analytics.routes.ts
export const getAnalyticsData = getAnalyticsOverview;