export const API_BASE_URL = 'https://api.zootramarket.com/v1';

export const USER_ROLES = {
    FARMER: 'farmer',
    PROVIDER: 'provider',
    ADMIN: 'admin',
    BUYER: 'buyer',
};

export const PRODUCT_CATEGORIES = [
    { id: 1, name: 'Livestock' },
    { id: 2, name: 'Feed' },
    { id: 3, name: 'Pet Products' },
    { id: 4, name: 'Animal Health' },
];

export const SERVICE_TYPES = [
    { id: 1, name: 'Veterinary' },
    { id: 2, name: 'Grooming' },
    { id: 3, name: 'Training' },
    { id: 4, name: 'Consultation' },
    { id: 5, name: 'Transport' },
];

export const WHATSAPP_MESSAGE_TEMPLATE = 'Hello, I am interested in your product: ';