class VerificationService {
  constructor() {
    this.similarityThreshold = 0.8;
  }

  calculateLevenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.calculateLevenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  normalizeText(text) {
    if (typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s@.-]/g, '')
      .replace(/\s+/g, ' ');
  }

  verifyField(originalValue, submittedValue, fieldType = 'text') {
    const normalizedOriginal = this.normalizeText(originalValue);
    const normalizedSubmitted = this.normalizeText(submittedValue);
    
    if (normalizedOriginal === normalizedSubmitted) {
      return {
        match: true,
        confidence: 100,
        similarity: 1.0,
        notes: 'Exact match'
      };
    }
    
    const similarity = this.calculateSimilarity(normalizedOriginal, normalizedSubmitted);
    const confidence = Math.round(similarity * 100);
    const match = similarity >= this.similarityThreshold;
    
    let notes = '';
    if (!match) {
      if (similarity > 0.5) {
        notes = 'Partial match - possible OCR error';
      } else {
        notes = 'Significant difference detected';
      }
    } else {
      notes = 'Good match within tolerance';
    }
    
    // Special handling for specific field types
    switch (fieldType) {
      case 'email':
        const emailMatch = this.verifyEmail(originalValue, submittedValue);
        return { ...emailMatch, similarity };
        
      case 'phone':
        const phoneMatch = this.verifyPhone(originalValue, submittedValue);
        return { ...phoneMatch, similarity };
        
      case 'date':
        const dateMatch = this.verifyDate(originalValue, submittedValue);
        return { ...dateMatch, similarity };
        
      default:
        return {
          match,
          confidence,
          similarity,
          notes
        };
    }
  }

  verifyEmail(original, submitted) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(submitted)) {
      return {
        match: false,
        confidence: 0,
        notes: 'Invalid email format'
      };
    }
    
    const similarity = this.calculateSimilarity(
      this.normalizeText(original),
      this.normalizeText(submitted)
    );
    
    return {
      match: similarity >= 0.9,
      confidence: Math.round(similarity * 100),
      notes: similarity >= 0.9 ? 'Valid email format' : 'Email mismatch'
    };
  }

  verifyPhone(original, submitted) {
    // Remove all non-digit characters
    const cleanOriginal = original.replace(/\D/g, '');
    const cleanSubmitted = submitted.replace(/\D/g, '');
    
    if (cleanOriginal === cleanSubmitted) {
      return {
        match: true,
        confidence: 100,
        notes: 'Phone numbers match'
      };
    }
    
    // Check if it's a formatting difference (e.g., +1 prefix)
    const similarity = this.calculateSimilarity(cleanOriginal, cleanSubmitted);
    
    return {
      match: similarity >= 0.8,
      confidence: Math.round(similarity * 100),
      notes: similarity >= 0.8 ? 'Phone format variation' : 'Phone number mismatch'
    };
  }

  verifyDate(original, submitted) {
    try {
      const originalDate = new Date(original);
      const submittedDate = new Date(submitted);
      
      if (originalDate.getTime() === submittedDate.getTime()) {
        return {
          match: true,
          confidence: 100,
          notes: 'Dates match exactly'
        };
      }
      
      // Check if it's just a format difference
      if (originalDate.toDateString() === submittedDate.toDateString()) {
        return {
          match: true,
          confidence: 95,
          notes: 'Same date, different format'
        };
      }
      
      return {
        match: false,
        confidence: 0,
        notes: 'Date mismatch'
      };
    } catch (error) {
      return {
        match: false,
        confidence: 0,
        notes: 'Invalid date format'
      };
    }
  }

  verifyDocument(extractedData, submittedData) {
    const results = [];
    const summary = {
      totalFields: 0,
      matchedFields: 0,
      averageConfidence: 0,
      overallMatch: false
    };

    let totalConfidence = 0;

    // Verify each submitted field against extracted data
    Object.entries(submittedData).forEach(([fieldName, submittedValue]) => {
      if (submittedValue && submittedValue.trim()) {
        const originalValue = extractedData[fieldName] || '';
        const fieldType = this.detectFieldType(fieldName, submittedValue);
        
        const verification = this.verifyField(originalValue, submittedValue, fieldType);
        
        results.push({
          field: fieldName,
          originalValue,
          submittedValue,
          ...verification,
          fieldType,
          timestamp: new Date()
        });

        summary.totalFields++;
        if (verification.match) {
          summary.matchedFields++;
        }
        totalConfidence += verification.confidence;
      }
    });

    if (summary.totalFields > 0) {
      summary.averageConfidence = Math.round(totalConfidence / summary.totalFields);
      summary.overallMatch = summary.matchedFields / summary.totalFields >= 0.7;
    }

    return {
      results,
      summary
    };
  }

  detectFieldType(fieldName, value) {
    const name = fieldName.toLowerCase();
    
    if (name.includes('email') || /@/.test(value)) {
      return 'email';
    }
    
    if (name.includes('phone') || name.includes('tel') || /^\+?[\d\s\-\(\)]+$/.test(value)) {
      return 'phone';
    }
    
    if (name.includes('date') || name.includes('birth') || /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(value)) {
      return 'date';
    }
    
    return 'text';
  }
}

module.exports = new VerificationService();
