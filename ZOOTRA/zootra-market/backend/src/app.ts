import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { authRoutes } from './routes/auth.routes';
import { productsRoutes } from './routes/products.routes';
import { servicesRoutes } from './routes/services.routes';
import { bookingsRoutes } from './routes/bookings.routes';
import { usersRoutes } from './routes/users.routes';
import { adminRoutes } from './routes/admin.routes';
import { categoriesRoutes } from './routes/categories.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import errorHandler from './middleware/errorHandler.middleware';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;