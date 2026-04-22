import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { db } from './config/database.config';
import envConfig from './config/env.config';

const PORT = envConfig.PORT;

// Verify Firestore connection then start HTTP server
db.listCollections()
    .then(() => {
        console.log('Connected to Firestore');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error('Firestore connection error:', err);
        process.exit(1);
    });