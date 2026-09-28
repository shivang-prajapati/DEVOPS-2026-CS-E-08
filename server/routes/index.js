const express = require('express');
const crmController = require('../controllers/crmController');
const authRoutes = require('./auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.get('/health', crmController.healthCheck);
router.post('/contact', crmController.createContact);
router.get('/contact', crmController.getContacts);
router.post('/enquiries', crmController.createEnquiry);
router.get('/enquiries', crmController.getEnquiries);
router.get('/properties', crmController.getProperties);
router.post('/properties', crmController.createProperty);

module.exports = router;
