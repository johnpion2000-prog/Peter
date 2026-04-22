# Zootra Market API Documentation

## Overview
The Zootra Market API provides endpoints for managing users, products, services, bookings, and categories within the platform. This documentation outlines the available endpoints, request/response formats, and authentication requirements.

## Base URL
The base URL for all API requests is:
```
http://localhost:5000/api
```

## Authentication
All endpoints require authentication via a Bearer token. The token should be included in the Authorization header of the request.

### Example:
```
Authorization: Bearer <your_token_here>
```

## Endpoints

### 1. Authentication

#### POST /auth/login
- **Description**: Log in a user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```
- **Response**:
  - **200 OK**: Returns user details and token.
  - **401 Unauthorized**: Invalid credentials.

#### POST /auth/register
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "1234567890",
    "password": "your_password"
  }
  ```
- **Response**:
  - **201 Created**: Returns user details.
  - **400 Bad Request**: Validation errors.

### 2. Users

#### GET /users
- **Description**: Get a list of all users (Admin only).
- **Response**:
  - **200 OK**: Returns an array of user objects.

#### GET /users/:id
- **Description**: Get details of a specific user.
- **Response**:
  - **200 OK**: Returns user object.
  - **404 Not Found**: User not found.

### 3. Products

#### GET /products
- **Description**: Get a list of all products.
- **Response**:
  - **200 OK**: Returns an array of product objects.

#### POST /products
- **Description**: Create a new product.
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "categoryId": "category_id",
    "title": "Product Title",
    "description": "Product Description",
    "price": 100,
    "images": ["image_url1", "image_url2"]
  }
  ```
- **Response**:
  - **201 Created**: Returns created product object.
  - **400 Bad Request**: Validation errors.

### 4. Services

#### GET /services
- **Description**: Get a list of all services.
- **Response**:
  - **200 OK**: Returns an array of service objects.

#### POST /services
- **Description**: Create a new service.
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "serviceType": "vet",
    "description": "Service Description",
    "price": 50,
    "availability": "9am - 5pm"
  }
  ```
- **Response**:
  - **201 Created**: Returns created service object.
  - **400 Bad Request**: Validation errors.

### 5. Bookings

#### GET /bookings
- **Description**: Get a list of all bookings for the authenticated user.
- **Response**:
  - **200 OK**: Returns an array of booking objects.

#### POST /bookings
- **Description**: Create a new booking.
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "serviceId": "service_id",
    "date": "2023-01-01",
    "time": "10:00",
    "status": "pending"
  }
  ```
- **Response**:
  - **201 Created**: Returns created booking object.
  - **400 Bad Request**: Validation errors.

### 6. Categories

#### GET /categories
- **Description**: Get a list of all categories.
- **Response**:
  - **200 OK**: Returns an array of category objects.

#### POST /categories
- **Description**: Create a new category (Admin only).
- **Request Body**:
  ```json
  {
    "name": "New Category"
  }
  ```
- **Response**:
  - **201 Created**: Returns created category object.
  - **400 Bad Request**: Validation errors.

## Error Handling
All API responses include a status code and a message. In case of an error, the response will contain an error object with details.

### Example Error Response:
```json
{
  "status": "error",
  "message": "Invalid request data"
}
```

## Conclusion
This API documentation provides a comprehensive overview of the Zootra Market API. For further details, please refer to the individual endpoint descriptions and request/response formats.