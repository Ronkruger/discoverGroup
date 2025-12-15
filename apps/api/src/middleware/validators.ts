import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation results
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
  }
  
  next();
};

// Auth validators
export const validateRegister = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long'),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[!@#$%^&*()_+={}:'"\\|,.<>/?-]/).withMessage('Password must contain special character'),
  
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
  
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors,
];

// Booking validators
export const validateBooking = [
  body('tourId')
    .isMongoId().withMessage('Invalid tour ID'),
  
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
  
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  
  body('numberOfPeople')
    .isInt({ min: 1, max: 50 }).withMessage('Number of people must be between 1 and 50'),
  
  body('preferredDate')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Special requests too long'),
  
  handleValidationErrors,
];

// Review validators
export const validateReview = [
  body('tourId')
    .isMongoId().withMessage('Invalid tour ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'-]+$/).withMessage('Comment contains invalid characters'),
  
  body('tourGuideRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Tour guide rating must be between 1 and 5'),
  
  body('cleanlinessRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),
  
  body('communicationRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  
  body('valueForMoneyRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Value for money rating must be between 1 and 5'),
  
  body('organizationRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Organization rating must be between 1 and 5'),
  
  handleValidationErrors,
];

// Contact form validator
export const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
  
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 20, max: 2000 }).withMessage('Message must be between 20 and 2000 characters'),
  
  handleValidationErrors,
];

// ID parameter validator
export const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  handleValidationErrors,
];

// Pagination validators
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors,
];

// Search validator
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/).withMessage('Search query contains invalid characters'),
  
  handleValidationErrors,
];

// Password reset validators
export const validatePasswordReset = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  handleValidationErrors,
];

export const validateNewPassword = [
  body('token')
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 20 }).withMessage('Invalid token'),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[!@#$%^&*()_+={}:'"\\|,.<>/?-]/).withMessage('Password must contain special character'),
  
  handleValidationErrors,
];
