const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

class OCRService {
  constructor() {
    this.tesseractOptions = {
      logger: m => console.log(m),
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?-_()[]{}@#$%^&*+=<>/|\\~`"\' ',
    };
  }

  async preprocessImage(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      await image
        .greyscale()
        .contrast(0.5)
        .normalize()
        .threshold({ max: 180 })
        .resize(image.bitmap.width * 2, image.bitmap.height * 2, Jimp.RESIZE_BILINEAR);

      const processedPath = imagePath.replace(path.extname(imagePath), '_processed' + path.extname(imagePath));
      await image.writeAsync(processedPath);
      
      return processedPath;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imagePath;
    }
  }

  async extractTextFromImage(imagePath, language = 'eng') {
    try {
      const processedImagePath = await this.preprocessImage(imagePath);
      
      const { data: { text, confidence, words } } = await Tesseract.recognize(
        processedImagePath,
        language,
        this.tesseractOptions
      );

      if (processedImagePath !== imagePath) {
        await fs.unlink(processedImagePath).catch(() => {});
      }

      return {
        text: text.trim(),
        confidence: Math.round(confidence),
        words: words.map(word => ({
          text: word.text,
          confidence: Math.round(word.confidence),
          bbox: word.bbox
        }))
      };
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
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

  parseRegistrationData(text) {
    const fields = {};
    const lines = text.split('\n').filter(line => line.trim());
    
    // Enhanced patterns for registration form data
    const patterns = {
      // Name patterns
      name: [
        /^(name|full name|first name|last name)[:\s]+(.+)$/i,
        /^(.+)\s+(name)$/i,
        /name[:\s]*([a-zA-Z\s]+)/i
      ],
      
      // Age patterns
      age: [
        /^(age)[:\s]+(\d+)$/i,
        /age[:\s]*(\d+)/i,
        /(\d+)\s*years?\s*old/i
      ],
      
      // Gender patterns
      gender: [
        /^(gender|sex)[:\s]+(male|female|other|m|f)$/i,
        /gender[:\s]*(male|female|other|m|f)/i,
        /(male|female)\s*$/i
      ],
      
      // Email patterns
      email: [
        /^(email|email id|e-mail)[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i,
        /email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      ],
      
      // Phone patterns
      phone: [
        /^(phone|mobile|contact|phone number|mobile number)[:\s]+([\+\d\s\-\(\)]+)$/i,
        /phone[:\s]*([\+\d\s\-\(\)]+)/i,
        /mobile[:\s]*([\+\d\s\-\(\)]+)/i,
        /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/
      ],
      
      // Address patterns
      address: [
        /^(address|addr|location)[:\s]+(.+)$/i,
        /address[:\s]*(.+)/i,
        /(\d+[,\s]+[a-zA-Z\s,.-]+)/
      ],
      
      // Date of Birth patterns
      dateOfBirth: [
        /^(date of birth|dob|birth date)[:\s]+(.+)$/i,
        /dob[:\s]*(.+)/i,
        /born[:\s]*(.+)/i,
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
      ],
      
      // Occupation patterns
      occupation: [
        /^(occupation|job|profession|work)[:\s]+(.+)$/i,
        /occupation[:\s]*(.+)/i,
        /works?\s+as[:\s]*(.+)/i
      ],
      
      // ID/License patterns
      id: [
        /^(id|identification|card number|license|aadhar|pan)[:\s#]*([a-zA-Z0-9]+)$/i,
        /id[:\s#]*([a-zA-Z0-9]+)/i
      ],
      
      // Nationality patterns
      nationality: [
        /^(nationality|citizen|country)[:\s]+(.+)$/i,
        /nationality[:\s]*(.+)/i,
        /citizen\s+of[:\s]*(.+)/i
      ]
    };

    // Process each line against all patterns
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      Object.entries(patterns).forEach(([fieldName, patternArray]) => {
        if (fields[fieldName]) return; // Skip if already found
        
        patternArray.forEach(pattern => {
          const match = trimmedLine.match(pattern);
          if (match) {
            let value = '';
            
            if (fieldName === 'name' || fieldName === 'address' || fieldName === 'occupation' || fieldName === 'nationality') {
              value = match[2] || match[1];
            } else if (fieldName === 'age') {
              value = match[2] || match[1];
            } else if (fieldName === 'gender') {
              const genderValue = (match[2] || match[1]).toLowerCase();
              if (genderValue === 'm' || genderValue === 'male') value = 'Male';
              else if (genderValue === 'f' || genderValue === 'female') value = 'Female';
              else value = 'Other';
            } else {
              value = match[1] || match[0];
            }
            
            if (value && value.trim()) {
              fields[fieldName] = value.trim();
            }
          }
        });
      });
    });
    
    // Post-processing cleanup
    Object.keys(fields).forEach(key => {
      if (fields[key]) {
        // Clean up common OCR artifacts
        fields[key] = fields[key]
          .replace(/[:|,]$/, '') // Remove trailing colons/commas
          .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
          .trim();
      }
    });

    // If no structured data found, try to extract from raw text
    if (Object.keys(fields).length === 0) {
      fields.rawText = text;
      
      // Try basic email extraction
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) fields.email = emailMatch[1];
      
      // Try basic phone extraction
      const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
      if (phoneMatch) fields.phone = phoneMatch[0];
    }

    return fields;
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

      const parsedData = this.parseRegistrationData(extractionResult.text);
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
