const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  originalFilename: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  extractedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  ocrConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  verificationResults: [{
    field: String,
    originalValue: String,
    submittedValue: String,
    match: Boolean,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['uploaded', 'processed', 'verified', 'error'],
    default: 'uploaded'
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
