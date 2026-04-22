import { body } from 'express-validator';

export const userValidator = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email must be a valid email address'),

    body('phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .isString()
        .withMessage('Phone number must be a string')
        .isLength({ min: 10, max: 15 })
        .withMessage('Phone number must be between 10 and 15 characters long'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('role')
        .optional()
        .isIn(['farmer', 'provider', 'admin', 'buyer'])
        .withMessage('Role must be one of the following: farmer, provider, admin, buyer'),
];

export const validateUser = userValidator;
export const validateRegistration = userValidator;
export const validateLogin = [
    body('email').notEmpty().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];