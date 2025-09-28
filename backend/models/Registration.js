const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  personalInfo: {
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    fullName: String,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: Date,
    age: Number,
    nationality: String,
    occupation: String
  },
  
  contactInfo: {
    phone: { type: String, required: true },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    }
  },
  
  address: {
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    fullAddress: String
  },
  
  metadata: {
    submittedAt: { type: Date, default: Date.now },
    extractedFrom: { type: String, default: 'OCR' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'verified' 
    },
    ipAddress: String,
    userAgent: String
  },
  
  verificationResults: [{
    field: String,
    originalValue: String,
    submittedValue: String,
    match: Boolean,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
registrationSchema.index({ 'contactInfo.email': 1 }, { unique: true });
registrationSchema.index({ 'contactInfo.phone': 1 });
registrationSchema.index({ 'metadata.submittedAt': -1 });
registrationSchema.index({ 'metadata.verificationStatus': 1 });

module.exports = mongoose.model('Registration', registrationSchema);
