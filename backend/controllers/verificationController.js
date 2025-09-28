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

      // Find the document
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Convert Map to plain object for verification
      const extractedData = Object.fromEntries(document.extractedData);

      // Create flat object for verification from nested submittedData
      const flatSubmittedData = {
        firstName: submittedData.personalInfo?.firstName,
        middleName: submittedData.personalInfo?.middleName,
        lastName: submittedData.personalInfo?.lastName,
        gender: submittedData.personalInfo?.gender,
        dateOfBirth: submittedData.personalInfo?.dateOfBirth,
        age: submittedData.personalInfo?.age,
        nationality: submittedData.personalInfo?.nationality,
        occupation: submittedData.personalInfo?.occupation,
        phone: submittedData.contactInfo?.phone,
        email: submittedData.contactInfo?.email,
        addressLine1: submittedData.address?.line1,
        addressLine2: submittedData.address?.line2,
        city: submittedData.address?.city,
        state: submittedData.address?.state,
        pinCode: submittedData.address?.pinCode
      };

      // Perform verification
      const verificationResult = verificationService.verifyDocument(extractedData, flatSubmittedData);

      // Create registration record with verification results
      const registration = new Registration({
        ...submittedData,
        metadata: {
          ...submittedData.metadata,
          documentId: documentId,
          verificationStatus: verificationResult.summary.overallMatch ? 'verified' : 'pending',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        },
        verificationResults: verificationResult.results
      });

      // Save registration to database
      const savedRegistration = await registration.save();

      // Update document with verification results
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
      
      // Handle duplicate email error
      if (error.code === 11000 && error.keyPattern?.['contactInfo.email']) {
        return res.status(400).json({
          success: false,
          message: 'Email address already exists in our records'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to verify and save registration',
        error: error.message
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
        // Search specific field
        searchCriteria[field] = { $regex: query, $options: 'i' };
      } else {
        // Search across multiple fields
        searchCriteria = {
          $or: [
            { 'personalInfo.firstName': { $regex: query, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: query, $options: 'i' } },
            { 'contactInfo.email': { $regex: query, $options: 'i' } },
            { 'contactInfo.phone': { $regex: query, $options: 'i' } }
          ]
        };
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
}

module.exports = new VerificationController();
