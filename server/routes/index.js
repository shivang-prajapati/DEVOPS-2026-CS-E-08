const express = require('express');
const crmController = require('../controllers/crmController');
const authRoutes = require('./auth');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.get('/health', crmController.healthCheck);
router.post('/contact', crmController.createContact);
router.get('/contact', authenticate, authorize('admin', 'manager'), crmController.getContacts);
router.post('/enquiries', crmController.createEnquiry);
router.get('/enquiries', authenticate, authorize('admin', 'manager', 'agent'), crmController.getEnquiries);
router.get('/properties', crmController.getProperties);
router.post('/properties', authenticate, authorize('admin', 'agent'), crmController.createProperty);

module.exports = router;
