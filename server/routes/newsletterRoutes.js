const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers, getNewsletterStats } = require('../controllers/newsletterController');
const { newsletterValidation } = require('../middleware/validate');
const { newsletterLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

router.post('/', newsletterLimiter, newsletterValidation, subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/stats', protect, getNewsletterStats);
router.get('/', protect, getSubscribers);

module.exports = router;
