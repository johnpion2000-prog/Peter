import { body } from 'express-validator';

export const createProductValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Price must be greater than zero');
      }
      return true;
    }),

  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isString()
    .withMessage('Invalid Category ID'),

  body('images')
    .isArray()
    .withMessage('Images must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('At least one image is required');
      }
      return true;
    }),
];

export const updateProductValidator = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Price must be greater than zero');
      }
      return true;
    }),

  body('categoryId')
    .optional()
    .isString()
    .withMessage('Invalid Category ID'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('At least one image is required');
      }
      return true;
    }),
];

export const validateProduct = createProductValidator;

export const validateService = [
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['vet', 'groomer', 'trainer', 'consultant', 'transport'])
    .withMessage('Invalid service type'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
];