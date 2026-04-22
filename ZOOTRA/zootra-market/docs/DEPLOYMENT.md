# Zootra Market Deployment Instructions

## Prerequisites

Before deploying the Zootra Market platform, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Docker (optional, for containerized deployment)
- Firebase CLI (if using Firebase for the backend)

## Deployment Steps

### 1. Clone the Repository

Clone the Zootra Market repository from GitHub:

```bash
git clone <repository-url>
cd zootra-market
```

### 2. Set Up the Frontend

Navigate to the frontend directory and install the dependencies:

```bash
cd frontend
npm install
```

### 3. Set Up the Backend

Navigate to the backend directory and install the dependencies:

```bash
cd ../backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in both the `frontend` and `backend` directories based on the provided `.env.example` files. Ensure to set the necessary environment variables, such as API keys, database URLs, and any other required configurations.

### 5. Database Setup

If using Firebase, initialize your Firebase project and set up Firestore:

```bash
firebase init
```

Run the seed scripts to populate the database with initial data:

```bash
cd ../database/seeds
ts-node seed_users.ts
ts-node seed_categories.ts
ts-node seed_products.ts
ts-node seed_services.ts
```

### 6. Start the Backend Server

Start the backend server:

```bash
cd ../../backend
npm run dev
```

### 7. Start the Frontend Application

In a new terminal, start the frontend application:

```bash
cd ../frontend
npm run dev
```

### 8. Access the Application

Once both servers are running, you can access the application in your web browser at:

```
http://localhost:3000
```

### 9. Docker Deployment (Optional)

If you prefer to deploy using Docker, ensure you have Docker installed and run the following command in the root directory:

```bash
docker-compose up --build
```

This will build and run the application in containers.

### 10. Additional Notes

- Ensure to check the logs for any errors during startup.
- For production deployment, consider using a process manager like PM2 for the backend and build the frontend for optimized performance.
- Update the Firestore rules and security settings as needed for production.

## Conclusion

You have successfully deployed the Zootra Market platform. For further customization and features, refer to the documentation in the `docs` directory.