import { config } from 'dotenv';

config();

const envConfig = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
};

export default envConfig;