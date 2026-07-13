const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const contactValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Company name cannot exceed 200 characters'),

  body('country')
    .trim()
    .notEmpty().withMessage('Country is required')
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isLength({ max: 100 }).withMessage('State cannot exceed 100 characters'),

  body('service')
    .trim()
    .notEmpty().withMessage('Please select a service')
    .isIn(['hotel', 'restaurant', 'corporate', 'seo', 'maintenance', 'template', 'other'])
    .withMessage('Please select a valid service option'),

  body('message')
    .trim()
    .notEmpty().withMessage('Project details are required')
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),

  body('honeypot')
    .optional()
    .custom((value) => {
      if (value && value.length > 0) throw new Error('Bot detected');
      return true;
    }),

  body('templateSource')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Template source cannot exceed 100 characters'),

  handleValidation,
];

const newsletterValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('honeypot')
    .optional()
    .custom((value) => {
      if (value && value.length > 0) throw new Error('Bot detected');
      return true;
    }),

  handleValidation,
];

module.exports = { contactValidation, newsletterValidation, handleValidation };
