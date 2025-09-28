const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

class OCRService {
  constructor() {
    // Enhanced options for handwritten text
    this.tesseractOptions = {
      logger: m => console.log(m),
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?-_()[]{}@#$%^&*+=<>/|\\~`"\' ',
      // Enhanced for handwriting
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      preserve_interword_spaces: '1',
    };
  }

  async preprocessImageForHandwriting(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      // Enhanced preprocessing specifically for handwritten text
      await image
        .greyscale()
        .contrast(0.8) // Higher contrast for handwriting
        .brightness(0.2) // Increase brightness
        .normalize()
        // Gaussian blur to smooth handwritten strokes
        .gaussian(0.5)
        // Higher resolution scaling for handwritten text
        .resize(image.bitmap.width * 3, image.bitmap.height * 3, Jimp.RESIZE_BICUBIC)
        // Adaptive threshold for handwriting
        .threshold({ max: 190, replace: 255, autoGreyscale: false });

      const processedPath = imagePath.replace(path.extname(imagePath), '_handwriting_processed' + path.extname(imagePath));
      await image.writeAsync(processedPath);
      
      return processedPath;
    } catch (error) {
      console.error('Handwriting preprocessing error:', error);
      return imagePath;
    }
  }

  async extractTextFromImage(imagePath, language = 'eng') {
    try {
      // Try both regular and handwriting-optimized preprocessing
      const regularProcessedPath = await this.preprocessImage(imagePath);
      const handwritingProcessedPath = await this.preprocessImageForHandwriting(imagePath);
      
      console.log('Attempting OCR with regular preprocessing...');
      const regularResult = await Tesseract.recognize(
        regularProcessedPath,
        language,
        this.tesseractOptions
      );
      
      console.log('Attempting OCR with handwriting preprocessing...');
      const handwritingResult = await Tesseract.recognize(
        handwritingProcessedPath,
        language,
        {
          ...this.tesseractOptions,
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        }
      );
      
      // Choose the result with higher confidence
      const result = regularResult.data.confidence > handwritingResult.data.confidence 
        ? regularResult : handwritingResult;
      
      console.log(`Selected result with confidence: ${result.data.confidence}%`);
      
      // Cleanup processed images
      await fs.unlink(regularProcessedPath).catch(() => {});
      await fs.unlink(handwritingProcessedPath).catch(() => {});

      return {
        text: result.data.text.trim(),
        confidence: Math.round(result.data.confidence),
        words: result.data.words.map(word => ({
          text: word.text,
          confidence: Math.round(word.confidence),
          bbox: word.bbox
        }))
      };
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  async preprocessImage(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      await image
        .greyscale()
        .contrast(0.6)
        .brightness(0.1)
        .normalize()
        .threshold({ max: 185 })
        .resize(image.bitmap.width * 2.5, image.bitmap.height * 2.5, Jimp.RESIZE_BICUBIC);

      const processedPath = imagePath.replace(path.extname(imagePath), '_processed' + path.extname(imagePath));
      await image.writeAsync(processedPath);
      
      return processedPath;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imagePath;
    }
  }

  async extractTextFromPDF(pdfPath) {
    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      
      return {
        text: pdfData.text.trim(),
        confidence: 90,
        words: []
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  parseDetailedFormData(text) {
    const fields = {};
    const lines = text.split('\n').filter(line => line.trim());
    
    console.log('Raw OCR Text for detailed parsing:', text);
    console.log('Lines to process:', lines);
    
    // Enhanced patterns for detailed form structure
    const patterns = {
      // Name patterns (First, Middle, Last)
      firstName: [
        /^(first name|firstname)[:\s]*[:-]?\s*(.+)$/i,
        /first[:\s]*[:-]?\s*(.+)$/i,
        /f\.?\s*name[:\s]*[:-]?\s*(.+)$/i
      ],
      
      middleName: [
        /^(middle name|middlename)[:\s]*[:-]?\s*(.+)$/i,
        /middle[:\s]*[:-]?\s*(.+)$/i,
        /m\.?\s*name[:\s]*[:-]?\s*(.+)$/i
      ],
      
      lastName: [
        /^(last name|lastname|surname|family name)[:\s]*[:-]?\s*(.+)$/i,
        /last[:\s]*[:-]?\s*(.+)$/i,
        /l\.?\s*name[:\s]*[:-]?\s*(.+)$/i,
        /surname[:\s]*[:-]?\s*(.+)$/i
      ],
      
      // Full name fallback
      name: [
        /^(name|full name)[:\s]*[:-]?\s*(.+)$/i,
        /^([A-Z][a-z]+ [A-Z][a-z]+)$/,
        /^([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)$/
      ],
      
      // Gender
      gender: [
        /^(gender|sex)[:\s]*[:-]?\s*(male|female|other|m|f)$/i,
        /(male|female)\s*$/i
      ],
      
      // Date of Birth
      dateOfBirth: [
        /^(date of birth|dob|birth date|d\.?o\.?b\.?)[:\s]*[:-]?\s*(.+)$/i,
        /born[:\s]*[:-]?\s*(.+)$/i,
        /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
        /(\d{1,2}\s*-\s*\d{1,2}\s*-\s*\d{2,4})/
      ],
      
      // Address components
      addressLine1: [
        /^(address line 1|addr line 1|address 1)[:\s]*[:-]?\s*(.+)$/i,
        /^(address)[:\s]*[:-]?\s*(.+)$/i
      ],
      
      addressLine2: [
        /^(address line 2|addr line 2|address 2)[:\s]*[:-]?\s*(.+)$/i
      ],
      
      city: [
        /^(city)[:\s]*[:-]?\s*(.+)$/i,
        /^(town)[:\s]*[:-]?\s*(.+)$/i
      ],
      
      state: [
        /^(state|province)[:\s]*[:-]?\s*(.+)$/i
      ],
      
      pinCode: [
        /^(pin code|pincode|postal code|zip code|zip)[:\s]*[:-]?\s*(\d{5,6})$/i,
        /pin[:\s]*[:-]?\s*(\d{5,6})/i,
        /(\d{6})/
      ],
      
      // Contact information
      phone: [
        /^(phone number|phone|mobile|contact)[:\s]*[:-]?\s*([\+\d\s\-\(\)]{10,15})$/i,
        /mobile[:\s]*[:-]?\s*([\+\d\s\-\(\)]{10,15})/i,
        /(\+?91[-\s]?[6-9]\d{9})/,
        /([6-9]\d{9})/
      ],
      
      email: [
        /^(email id|email|e-mail)[:\s]*[:-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i,
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      ],
      
      // Additional fields
      age: [
        /^(age)[:\s]*[:-]?\s*(\d{1,3})$/i,
        /(\d{1,3})\s*years?\s*old/i
      ],
      
      occupation: [
        /^(occupation|job|profession|work)[:\s]*[:-]?\s*(.+)$/i
      ],
      
      nationality: [
        /^(nationality|citizen|country)[:\s]*[:-]?\s*(.+)$/i
      ]
    };

    // Process each line against patterns
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      console.log(`Processing line ${index + 1}: "${trimmedLine}"`);
      
      Object.entries(patterns).forEach(([fieldName, patternArray]) => {
        if (fields[fieldName]) return;
        
        patternArray.forEach((pattern, patternIndex) => {
          const match = trimmedLine.match(pattern);
          if (match) {
            console.log(`Found ${fieldName} with pattern ${patternIndex}: ${match[0]}`);
            let value = '';
            
            if (fieldName === 'pinCode') {
              value = match[2] || match[1];
              if (/^\d{5,6}$/.test(value)) {
                fields[fieldName] = value;
                console.log(`Extracted ${fieldName}: ${value}`);
              }
            } else if (fieldName === 'phone') {
              value = match[2] || match[1];
              value = this.cleanPhoneNumber(value);
              if (value) {
                fields[fieldName] = value;
                console.log(`Extracted ${fieldName}: ${value}`);
              }
            } else if (fieldName === 'gender') {
              const genderValue = (match[2] || match[1]).toLowerCase();
              if (genderValue === 'm' || genderValue === 'male') value = 'Male';
              else if (genderValue === 'f' || genderValue === 'female') value = 'Female';
              else value = 'Other';
              fields[fieldName] = value;
              console.log(`Extracted ${fieldName}: ${value}`);
            } else {
              value = match[2] || match[1];
              if (value && value.trim()) {
                fields[fieldName] = value.trim();
                console.log(`Extracted ${fieldName}: ${value.trim()}`);
              }
            }
          }
        });
      });
    });

    // Create full name from components if available
    if (!fields.name && (fields.firstName || fields.lastName)) {
      const nameParts = [];
      if (fields.firstName) nameParts.push(fields.firstName);
      if (fields.middleName) nameParts.push(fields.middleName);
      if (fields.lastName) nameParts.push(fields.lastName);
      fields.name = nameParts.join(' ');
    }

    // Create full address from components
    if (fields.addressLine1 || fields.city || fields.state) {
      const addressParts = [];
      if (fields.addressLine1) addressParts.push(fields.addressLine1);
      if (fields.addressLine2) addressParts.push(fields.addressLine2);
      if (fields.city) addressParts.push(fields.city);
      if (fields.state) addressParts.push(fields.state);
      if (fields.pinCode) addressParts.push(fields.pinCode);
      fields.address = addressParts.join(', ');
    }
    
    console.log('Final extracted fields:', fields);
    return fields;
  }

  cleanPhoneNumber(phoneStr) {
    if (!phoneStr) return null;
    
    let cleaned = phoneStr.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return '+91-' + cleaned;
    }
    
    if (phoneStr.startsWith('+') && cleaned.length >= 10 && cleaned.length <= 15) {
      return phoneStr;
    }
    
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return cleaned;
    }
    
    return null;
  }

  async processDocument(filePath, mimetype) {
    const startTime = Date.now();
    
    try {
      let extractionResult;
      
      if (mimetype === 'application/pdf') {
        extractionResult = await this.extractTextFromPDF(filePath);
      } else {
        extractionResult = await this.extractTextFromImage(filePath);
      }

      console.log('OCR extraction completed, parsing detailed form data...');
      const parsedData = this.parseDetailedFormData(extractionResult.text);
      const processingTime = Date.now() - startTime;

      return {
        extractedText: extractionResult.text,
        parsedData,
        confidence: extractionResult.confidence,
        words: extractionResult.words,
        processingTime
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OCRService();
