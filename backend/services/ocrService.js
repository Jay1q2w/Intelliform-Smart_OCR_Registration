const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

class OCRService {
  constructor() {
    this.tesseractOptions = {
      logger: m => console.log(m),
      tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,  // <-- SYNTAX ERROR: Missing comma here!
      tessedit_char_whitelist: '...'
    };
  }

  async preprocessImage(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      // Improved image processing pipeline for better OCR accuracy
      await image
        .greyscale() // 1. Convert the image to grayscale
        .invert()    // 2. Invert the colors (IMPORTANT: turns white text on dark bg to black text on light bg)
        .contrast(1) // 3. Apply maximum contrast to make text sharp and clear
        .normalize() // 4. Normalize the image to improve overall quality
        .resize(image.bitmap.width * 2, image.bitmap.height * 2, Jimp.RESIZE_BILINEAR); // 5. Enlarge image for better character recognition

      const processedPath = imagePath.replace(path.extname(imagePath), '_processed' + path.extname(imagePath));
      await image.writeAsync(processedPath);
      
      return processedPath;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      // If preprocessing fails, return the original path to attempt OCR anyway
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
      // Name patterns (Unchanged)
      name: [
        /^(name|full name|first name|last name|nome|nam|nama|mame)[:\s]+(.+)$/i,
        /^(.+)\s+(name)$/i,
        /name[:\s]*([a-zA-Z\s]+)/i
      ],
      
      // Age patterns (Unchanged)
      age: [
        /^(age)[:\s]+(\d+)$/i,
        /age[:\s]*(\d+)/i,
        /(\d+)\s*years?\s*old/i
      ],
      
      // Gender patterns (Unchanged)
      gender: [
        /^(gender|sex|gende|ender|gander)[:\s]+(male|female|other|m|f)$/i,
        /gender[:\s]*(male|female|other|m|f)/i,
        /(male|female)\s*$/i
      ],
      
      // Email patterns (Unchanged)
      email: [
        /^(email|email id|e-mail|mail|maail|gmail|)[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i,
        /email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      ],
      
      // Phone patterns (UPDATED FOR MORE FLEXIBILITY)
      phone: [
        // This pattern is good, it looks for a label like "Phone:"
        /^(phone|mobile|contact|phone number|mobile number|fone)[:\s]+([\+\d\s\-\(\)]+)/i,
        
        /(\+?[\d\s\-()]{8,})/
      ],
      
      // Address patterns (Unchanged)
      address: [
        /^(address|addr|location)[:\s]+(.+)$/i,
        /address[:\s]*(.+)/i,
        /(\d+[,\s]+[a-zA-Z\s,.-]+)/
      ],
      
        dateOfBirth: [
        /^(date of birth|dob|d\.o\.b\.|birth date|birthdate|DOB|D.O.B)[:\s]+(.+)/i,
        /(\d{1,2}[-\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|may|june|july|august|september|october)[a-z]*[-\s]\d{2,4})/i,
        /(\d{1,2}[\/\-.]\s?\d{1,2}[\/\-.]\s?\d{2,4})/
      ],

      
      // Occupation patterns (Unchanged)
      occupation: [
        /^(Occupation|Job|profession|work)[:\s]+(.+)$/i,
        /occupation[:\s]*(.+)/i,
        /works?\s+as[:\s]*(.+)/i
      ],
      
      // ID/License patterns (Unchanged)
      id: [
        /^(id|identification|card number|license|aadhar|pan)[:\s#]*([a-zA-Z0-9]+)$/i,
        /id[:\s#]*([a-zA-Z0-9]+)/i
      ],
      
      // Nationality patterns (Unchanged)
      nationality: [
        /^(nationality|citizen|country)[:\s]+(.+)$/i,
        /nationality[:\s]*(.+)/i,
        /citizen\s+of[:\s]*(.+)/i
      ],
    emergencycontact: [
        /^(emergency phone|emergency mobile|emergency contact|emergency phone number|emergency mobile number|emergency)[:\s]+([\+\d\s\-\(\)]+)/i,
        /(\+?[\d\s\-()]{8,})/
      ]
};
    // Process each line against all patterns
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      Object.entries(patterns).forEach(([fieldName, patternArray]) => {
        if (fields[fieldName]) return; // Skip if already found
        
        patternArray.forEach(pattern => {
          const match = trimmedLine.match(pattern);
          console.log(`[OCR RAW LINE]: "${trimmedLine}"`);
          if (match) {
            let value = '';
            
            // This logic is complex, let's simplify value extraction
            if (match.length > 2) { // Typically for patterns like (key)(value)
              value = match[2] || match[1];
            } else if (match.length > 1) { // Typically for patterns that just find the (value)
              value = match[1] || match[0];
            } else {
              value = match[0];
            }

            if (fieldName === 'gender') {
              const genderValue = value.toLowerCase();
              if (genderValue.startsWith('m')) value = 'Male';
              else if (genderValue.startsWith('f')) value = 'Female';
              else value = 'Other';
            }
            
            if (value && value.trim()) {
              fields[fieldName] = value.trim();
            }
          }
        });
      });
    });
    
    // Post-processing cleanup (Unchanged)
    Object.keys(fields).forEach(key => {
      if (fields[key]) {
        fields[key] = fields[key]
          .replace(/[:|,]$/, '')
          .replace(/^\W+|\W+$/g, '')
          .trim();
      }
    });

    // Fallback if no structured data found (Unchanged)
    if (Object.keys(fields).length === 0) {
      fields.rawText = text;
      
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) fields.email = emailMatch[1];
      
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
