const express = require('express');
const router = express.Router();
const {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  deleteAllContacts,
  getContactStats,
} = require('../controllers/contactController');
const { contactValidation } = require('../middleware/validate');
const { contactLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

// Public route - submit contact form
router.post('/', contactLimiter, contactValidation, submitContact);

// Admin routes (protected)
router.get('/stats', protect, getContactStats);
router.delete('/bulk/all', protect, deleteAllContacts);
router.get('/', protect, getContacts);
router.get('/:id', protect, getContact);
router.put('/:id', protect, updateContactStatus);
router.delete('/:id', protect, deleteContact);

module.exports = router;
