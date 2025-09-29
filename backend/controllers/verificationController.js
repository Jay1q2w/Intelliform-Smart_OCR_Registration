const Document = require('../models/Document');
const Registration = require('../models/Registration');
const verificationService = require('../services/verificationService');

class VerificationController {
  async verifyAndSaveRegistration(req, res) {
    try {
      const { documentId, submittedData } = req.body;

      if (!documentId || !submittedData) {
        return res.status(400).json({
          success: false,
          message: 'Document ID and submitted data are required'
        });
      }

      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Convert Map to plain object for verification - handle both Map and plain object
      let extractedData = {};
      if (document.extractedData) {
        if (document.extractedData instanceof Map) {
          extractedData = Object.fromEntries(document.extractedData);
        } else {
          extractedData = document.extractedData;
        }
      }

      console.log('Extracted data from document:', extractedData);
      console.log('Submitted data from form:', submittedData);

      // Perform verification using the existing verification service
      const verificationResult = verificationService.verifyDocument(extractedData, submittedData);

      // Create registration record - keep existing structure from frontend
      const registration = new Registration(submittedData);
      
      // Add metadata
      registration.metadata = {
        submittedAt: new Date(),
        extractedFrom: 'OCR',
        documentId: documentId,
        verificationStatus: verificationResult.summary.overallMatch ? 'verified' : 'pending',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        processingTime: Date.now() - (req.body.startTime || Date.now()),
        ocrConfidence: document.ocrConfidence
      };

      // Add verification results
      registration.verificationResults = verificationResult.results;

      // Save registration to database
      const savedRegistration = await registration.save();

      // Update document with verification results
      if (!document.verificationResults) {
        document.verificationResults = [];
      }
      document.verificationResults = verificationResult.results;
      document.status = 'verified';
      await document.save();

      console.log('Registration saved successfully:', savedRegistration._id);

      res.status(200).json({
        success: true,
        message: 'Registration verified and saved successfully',
        data: {
          registrationId: savedRegistration._id,
          documentId,
          verificationResults: verificationResult.results,
          summary: verificationResult.summary,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Verification and save error:', error);
      
      if (error.code === 11000 && error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: 'Email address already exists in our records'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to verify and save registration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getRegistration(req, res) {
    try {
      const { id } = req.params;
      
      const registration = await Registration.findById(id)
        .populate('metadata.documentId', 'originalFilename createdAt');
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.status(200).json({
        success: true,
        data: registration
      });

    } catch (error) {
      console.error('Get registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve registration',
        error: error.message
      });
    }
  }

  async getAllRegistrations(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const registrations = await Registration.find()
        .populate('metadata.documentId', 'originalFilename createdAt')
        .sort({ 'metadata.submittedAt': -1 })
        .skip(skip)
        .limit(limit);

      const total = await Registration.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          registrations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get registrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve registrations',
        error: error.message
      });
    }
  }

  async searchRegistrations(req, res) {
    try {
      const { query, field } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      let searchCriteria = {};
      
      if (field) {
        searchCriteria[field] = { $regex: query, $options: 'i' };
      } else {
        searchCriteria = {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } },
            { address: { $regex: query, $options: 'i' } }
          ]
        };

        // Add occupation and nationality if they exist in the model
        if (Registration.schema.paths.occupation) {
          searchCriteria.$or.push({ occupation: { $regex: query, $options: 'i' } });
        }
        if (Registration.schema.paths.nationality) {
          searchCriteria.$or.push({ nationality: { $regex: query, $options: 'i' } });
        }
      }

      const registrations = await Registration.find(searchCriteria)
        .populate('metadata.documentId', 'originalFilename createdAt')
        .sort({ 'metadata.submittedAt': -1 })
        .limit(50);

      res.status(200).json({
        success: true,
        data: {
          registrations,
          count: registrations.length
        }
      });

    } catch (error) {
      console.error('Search registrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search registrations',
        error: error.message
      });
    }
  }

  async getRegistrationStats(req, res) {
    try {
      const totalRegistrations = await Registration.countDocuments();
      const verifiedRegistrations = await Registration.countDocuments({ 'metadata.verificationStatus': 'verified' });
      const pendingRegistrations = await Registration.countDocuments({ 'metadata.verificationStatus': 'pending' });
      
      res.status(200).json({
        success: true,
        data: {
          total: totalRegistrations,
          verified: verifiedRegistrations,
          pending: pendingRegistrations,
          rejected: totalRegistrations - verifiedRegistrations - pendingRegistrations
        }
      });

    } catch (error) {
      console.error('Get registration stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve registration statistics',
        error: error.message
      });
    }
  }
}

module.exports = new VerificationController();
