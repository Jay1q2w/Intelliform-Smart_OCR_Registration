const express = require('express');
const router = express.Router();
const { uploadSingle, cleanupOnError } = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');
const ocrController = require('../controllers/ocrController');

// Apply cleanup middleware to all routes
router.use(cleanupOnError);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'OCR routes working!' });
});

// POST /api/ocr/extract - Extract text from uploaded document
router.post('/extract', 
  optionalAuth,
  ...uploadSingle('document'), 
  ocrController.extractText
);

// GET /api/ocr/document/:id - Get document by ID
router.get('/document/:id', optionalAuth, ocrController.getDocument);

// GET /api/ocr/documents - Get all documents with pagination
router.get('/documents', optionalAuth, ocrController.getAllDocuments);

// DELETE /api/ocr/document/:id - Delete document
router.delete('/document/:id', optionalAuth, ocrController.deleteDocument);

module.exports = router;
