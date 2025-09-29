const Document = require('../models/Document');
const ocrService = require('../services/ocrService');
const fs = require('fs').promises;

class OCRController {
  async extractText(req, res) {
    console.log('Extract text endpoint hit');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
    
    try {
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select a file.'
        });
      }

      const { filename, originalname, path: filepath, size, mimetype } = req.file;
      console.log('Processing file:', { filename, originalname, filepath, size, mimetype });

      // Create document record
      const document = new Document({
        originalFilename: originalname,
        filename,
        filepath,
        filesize: size,
        mimetype,
        status: 'uploaded'
      });

      await document.save();
      console.log('Document saved to database:', document._id);

      // Process the document
      console.log('Starting OCR processing...');
      const processingResult = await ocrService.processDocument(filepath, mimetype);
      console.log('OCR processing completed:', {
        confidence: processingResult.confidence,
        processingTime: processingResult.processingTime
      });

      // Update document with extracted data
      document.extractedData = processingResult.parsedData;
      document.ocrConfidence = processingResult.confidence;
      document.processingTime = processingResult.processingTime;
      document.status = 'processed';

      await document.save();
      console.log('Document updated with OCR results');

      res.status(200).json({
        success: true,
        message: 'Text extracted successfully',
        data: {
          documentId: document._id,
          extractedText: processingResult.extractedText,
          parsedData: processingResult.parsedData,
          confidence: processingResult.confidence,
          processingTime: processingResult.processingTime,
          wordCount: processingResult.extractedText.split(' ').length
        }
      });

    } catch (error) {
      console.error('OCR extraction error:', error);
      
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
          console.log('Cleaned up file on error:', req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Text extraction failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getDocument(req, res) {
    try {
      const { id } = req.params;
      console.log('Getting document:', id);
      
      const document = await Document.findById(id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      res.status(200).json({
        success: true,
        data: document
      });

    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve document',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getAllDocuments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const documents = await Document.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-filepath'); // Exclude file path for security

      const total = await Document.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          documents,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve documents',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      
      const document = await Document.findById(id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Delete the file from filesystem
      try {
        await fs.unlink(document.filepath);
        console.log('File deleted:', document.filepath);
      } catch (fileError) {
        console.error('Failed to delete file:', fileError);
      }
    
      // Delete from database
      await Document.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new OCRController();
