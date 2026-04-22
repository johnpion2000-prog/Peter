import { body } from 'express-validator';

export const bookingValidator = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isString()
        .withMessage('User ID must be a string'),
    body('serviceId')
        .optional()
        .isString()
        .withMessage('Service ID must be a string'),
    body('date')
        .isISO8601()
        .toDate()
        .withMessage('Date must be a valid date'),
    body('time')
        .notEmpty()
        .withMessage('Time is required'),
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
        .withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
];