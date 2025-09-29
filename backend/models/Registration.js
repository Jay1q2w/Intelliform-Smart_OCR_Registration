const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // Basic Information Fields - allowing multiple registrations
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  
  age: { 
    type: Number,
    min: 1,
    max: 150
  },
  
  gender: { 
    type: String,
    enum: ['Male', 'Female', 'Other', '']
  },
  
  dateOfBirth: {
    type: String
  },
  
  occupation: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  nationality: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  address: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  
  // NO UNIQUE CONSTRAINT ON EMAIL - allows multiple registrations
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
  },
  
  phone: { 
    type: String, 
    required: true,
    trim: true
  },
  
  emergencyContact: {
    type: String,
    trim: true
  },
  
  // Metadata
  metadata: {
    submittedAt: { type: Date, default: Date.now },
    extractedFrom: { type: String, default: 'OCR' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    ipAddress: String,
    userAgent: String,
    processingTime: Number,
    ocrConfidence: Number
  },
  
  // Verification Results
  verificationResults: [{
    field: {
      type: String,
      required: true
    },
    originalValue: String,
    submittedValue: String,
    match: {
      type: Boolean,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance - NO UNIQUE CONSTRAINTS
registrationSchema.index({ email: 1 });  // No unique: true
registrationSchema.index({ phone: 1 });
registrationSchema.index({ 'metadata.submittedAt': -1 });
registrationSchema.index({ 'metadata.verificationStatus': 1 });
registrationSchema.index({ name: 'text', address: 'text' });

// Pre-save middleware to clean data
registrationSchema.pre('save', function(next) {
  // Clean and format phone numbers
  if (this.phone) {
    this.phone = this.phone.replace(/[^\d\+\-\(\)\s]/g, '').trim();
  }
  
  if (this.emergencyContact) {
    this.emergencyContact = this.emergencyContact.replace(/[^\d\+\-\(\)\s]/g, '').trim();
  }
  
  // Clean name
  if (this.name) {
    this.name = this.name.replace(/\s+/g, ' ').trim();
  }
  
  // Clean address
  if (this.address) {
    this.address = this.address.replace(/\s+/g, ' ').trim();
  }
  
  // Clean occupation and nationality
  if (this.occupation) {
    this.occupation = this.occupation.trim();
  }
  
  if (this.nationality) {
    this.nationality = this.nationality.trim();
  }
  
  next();
});

// Add virtual field for registration number
registrationSchema.virtual('registrationNumber').get(function() {
  return `REG-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Static method to search registrations
registrationSchema.statics.searchRegistrations = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } },
      { address: { $regex: query, $options: 'i' } },
      { occupation: { $regex: query, $options: 'i' } },
      { nationality: { $regex: query, $options: 'i' } }
    ]
  });
};

module.exports = mongoose.model('Registration', registrationSchema);
