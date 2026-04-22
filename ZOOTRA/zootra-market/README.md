# Zootra Market

Zootra Market is a comprehensive web application designed to connect farmers, pet owners, and service providers in a seamless marketplace. This platform allows users to buy and sell products, book services, and manage their listings efficiently.

## Features

### Frontend
- Built with **React** and **TypeScript** for a robust user experience.
- Utilizes **Tailwind CSS** for responsive and modern styling.
- Includes a landing page with sections for product categories, customer services, and a call to action.
- Public dashboard for farmers and pet owners with features like:
  - Manage listings (Create, Read, Update, Delete)
  - View and manage bookings
  - WhatsApp integration for direct communication
  - Form to become a service provider
- Admin dashboard with functionalities to:
  - Manage users, listings, and services
  - Verify sellers and service providers
  - View analytics and reports

### Backend
- Built with **Node.js** and **Express** for handling API requests.
- Implements role-based access control for different user types (farmer, admin).
- Connects to **Firebase** for database management and real-time data handling.
- Includes controllers for managing authentication, products, services, bookings, and analytics.

### Database
- Utilizes Firebase Firestore for storing user, product, service, and booking data.
- Supports seeding scripts for initial data population.

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.
- Firebase account for database management.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd zootra-market
   ```

2. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```

3. Navigate to the backend directory and install dependencies:
   ```
   cd ../backend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in both the `frontend` and `backend` directories and configure your Firebase credentials and other necessary environment variables.

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend application:
   ```
   cd ../frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## Testing

- Unit tests are located in the `tests/unit` directory.
- Integration tests are located in the `tests/integration` directory.
- End-to-end tests are located in the `tests/e2e` directory.
- Run tests using:
  ```
  npm test
  ```

## Documentation

- API documentation can be found in the `docs/API_DOCS.md`.
- Deployment instructions are available in `docs/DEPLOYMENT.md`.
- User and admin guides are provided in `docs/USER_GUIDE.md` and `docs/ADMIN_GUIDE.md`, respectively.

## License

This project is licensed under the MIT License. See the LICENSE file for details.