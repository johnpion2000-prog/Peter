import request from 'supertest';
import app from '../../backend/src/app'; // Adjust the path as necessary

describe('API Integration Tests', () => {
    it('should return 200 for the root endpoint', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('should register a new user', async () => {
        const newUser = {
            name: 'Test User',
            email: 'testuser@example.com',
            phone: '1234567890',
            password: 'password123',
            role: 'farmer'
        };

        const response = await request(app).post('/api/auth/register').send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should login a user', async () => {
        const credentials = {
            email: 'testuser@example.com',
            password: 'password123'
        };

        const response = await request(app).post('/api/auth/login').send(credentials);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should create a new product', async () => {
        const product = {
            userId: '1', // Replace with a valid user ID
            categoryId: '1', // Replace with a valid category ID
            title: 'Test Product',
            description: 'This is a test product',
            price: 100,
            images: []
        };

        const response = await request(app).post('/api/products').send(product);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Product created successfully');
    });

    it('should fetch all products', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should delete a product', async () => {
        const response = await request(app).delete('/api/products/1'); // Replace with a valid product ID
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Product deleted successfully');
    });
});