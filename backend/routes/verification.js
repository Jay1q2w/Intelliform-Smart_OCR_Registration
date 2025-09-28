const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// POST /api/verification/register - Verify and save registration
router.post('/register', verificationController.verifyAndSaveRegistration);

// GET /api/verification/registration/:id - Get specific registration
router.get('/registration/:id', verificationController.getRegistration);

// GET /api/verification/registrations - Get all registrations
router.get('/registrations', verificationController.getAllRegistrations);

// GET /api/verification/search - Search registrations
router.get('/search', verificationController.searchRegistrations);

module.exports = router;
