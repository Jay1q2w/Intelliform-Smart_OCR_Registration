class VerificationService {
  verifyDocument(extractedData, submittedData) {
    console.log('Starting verification process...');
    console.log('Extracted data keys:', Object.keys(extractedData));
    console.log('Submitted data keys:', Object.keys(submittedData));

    const results = [];
    
    // Get all fields from submitted data to verify
    const fieldsToVerify = Object.keys(submittedData).filter(field => 
      field !== 'metadata' && field !== 'verificationResults' && submittedData[field] !== ''
    );
    
    console.log('Fields to verify:', fieldsToVerify);
    
    fieldsToVerify.forEach(field => {
      const originalValue = extractedData[field] || '';
      const submittedValue = submittedData[field] || '';
      
      // Skip metadata fields and empty values
      if (field === 'metadata' || field === 'verificationResults') {
        return;
      }
      
      const verification = this.verifyField(field, originalValue, submittedValue);
      results.push({
        field,
        originalValue: originalValue.toString(),
        submittedValue: submittedValue.toString(),
        match: verification.match,
        confidence: verification.confidence,
        timestamp: new Date()
      });
    });

    const summary = this.generateSummary(results);
    
    console.log('Verification completed. Summary:', summary);
    
    return {
      results,
      summary
    };
  }

  verifyField(fieldName, originalValue, submittedValue) {
    // Handle empty values
    if (!originalValue && !submittedValue) {
      return { match: true, confidence: 100 };
    }
    
    if (!originalValue || !submittedValue) {
      // If original is empty but submitted has value, it's a partial match
      if (!originalValue && submittedValue) {
        return { match: false, confidence: 50 };
      }
      return { match: false, confidence: 0 };
    }

    const original = originalValue.toString().toLowerCase().trim();
    const submitted = submittedValue.toString().toLowerCase().trim();

    // Exact match
    if (original === submitted) {
      return { match: true, confidence: 100 };
    }

    // Field-specific verification logic
    switch (fieldName) {
      case 'name':
        return this.verifyName(original, submitted);
      
      case 'age':
        return this.verifyAge(original, submitted);
      
      case 'gender':
        return this.verifyGender(original, submitted);
      
      case 'email':
        return this.verifyEmail(original, submitted);
      
      case 'phone':
      case 'emergencyContact':
        return this.verifyPhone(original, submitted);
      
      case 'dateOfBirth':
        return this.verifyDate(original, submitted);
      
      case 'address':
        return this.verifyAddress(original, submitted);
      
      case 'occupation':
      case 'nationality':
        return this.verifyText(original, submitted);
      
      default:
        return this.verifyGeneric(original, submitted);
    }
  }

  verifyName(original, submitted) {
    // Remove extra spaces and normalize
    const normalizeNamePart = (name) => name.replace(/\s+/g, ' ').trim();
    const orig = normalizeNamePart(original);
    const subm = normalizeNamePart(submitted);
    
    if (orig === subm) {
      return { match: true, confidence: 100 };
    }

    // Check if names contain each other
    const origWords = orig.split(' ').filter(word => word.length > 0);
    const submWords = subm.split(' ').filter(word => word.length > 0);
    
    const commonWords = origWords.filter(word => 
      submWords.some(submWord => 
        this.calculateSimilarity(word, submWord) > 0.8
      )
    );
    
    const similarity = commonWords.length / Math.max(origWords.length, submWords.length);
    const confidence = Math.round(similarity * 100);
    
    return {
      match: confidence >= 70,
      confidence
    };
  }

  verifyAge(original, submitted) {
    const origAge = parseInt(original);
    const submAge = parseInt(submitted);
    
    if (isNaN(origAge) || isNaN(submAge)) {
      return { match: false, confidence: 0 };
    }
    
    const diff = Math.abs(origAge - submAge);
    
    if (diff === 0) {
      return { match: true, confidence: 100 };
    } else if (diff <= 1) {
      return { match: true, confidence: 90 };
    } else if (diff <= 2) {
      return { match: false, confidence: 70 };
    } else {
      return { match: false, confidence: Math.max(0, 50 - (diff * 10)) };
    }
  }

  verifyGender(original, submitted) {
    const genderMap = {
      'm': 'male',
      'f': 'female',
      'male': 'male',
      'female': 'female',
      'other': 'other'
    };
    
    const orig = genderMap[original.toLowerCase()] || original.toLowerCase();
    const subm = genderMap[submitted.toLowerCase()] || submitted.toLowerCase();
    
    if (orig === subm) {
      return { match: true, confidence: 100 };
    }
    
    return { match: false, confidence: 0 };
  }

  verifyEmail(original, submitted) {
    const orig = original.toLowerCase().trim();
    const subm = submitted.toLowerCase().trim();
    
    if (orig === subm) {
      return { match: true, confidence: 100 };
    }
    
    // Check if the domain and username are similar
    const origParts = orig.split('@');
    const submParts = subm.split('@');
    
    if (origParts.length === 2 && submParts.length === 2) {
      const usernameSim = this.calculateSimilarity(origParts[0], submParts[0]);
      const domainSim = this.calculateSimilarity(origParts[1], submParts[1]);
      
      const avgSimilarity = (usernameSim + domainSim) / 2;
      const confidence = Math.round(avgSimilarity * 100);
      
      return {
        match: confidence >= 80,
        confidence
      };
    }
    
    return { match: false, confidence: 0 };
  }

  verifyPhone(original, submitted) {
    // Normalize phone numbers - remove all non-digits except +
    const normalizePhone = (phone) => {
      return phone.replace(/[^\d+]/g, '');
    };
    
    const orig = normalizePhone(original);
    const subm = normalizePhone(submitted);
    
    if (orig === subm) {
      return { match: true, confidence: 100 };
    }
    
    // Check if one number is a subset of another (country code scenarios)
    if (orig.includes(subm) || subm.includes(orig)) {
      return { match: true, confidence: 90 };
    }
    
    // Check similarity of last 10 digits for international numbers
    const origLast10 = orig.slice(-10);
    const submLast10 = subm.slice(-10);
    
    if (origLast10 === submLast10 && origLast10.length === 10) {
      return { match: true, confidence: 85 };
    }
    
    return { match: false, confidence: 0 };
  }

  verifyDate(original, submitted) {
    // Try to parse dates in various formats
    const parseDate = (dateStr) => {
      const formats = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
        /(\d{2,4})[-\/](\d{1,2})[-\/](\d{1,2})/
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          return {
            part1: match[1],
            part2: match[2], 
            part3: match[3]
          };
        }
      }
      return null;
    };
    
    const origDate = parseDate(original);
    const submDate = parseDate(submitted);
    
    if (!origDate || !submDate) {
      return { match: false, confidence: 0 };
    }
    
    // Compare date parts
    const matches = [
      origDate.part1 === submDate.part1,
      origDate.part2 === submDate.part2,
      origDate.part3 === submDate.part3
    ].filter(Boolean).length;
    
    const confidence = Math.round((matches / 3) * 100);
    
    return {
      match: matches >= 2,
      confidence
    };
  }

  verifyAddress(original, submitted) {
    const normalizeAddress = (addr) => {
      return addr.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const orig = normalizeAddress(original);
    const subm = normalizeAddress(submitted);
    
    if (orig === subm) {
      return { match: true, confidence: 100 };
    }
    
    const origWords = orig.split(' ').filter(word => word.length > 2);
    const submWords = subm.split(' ').filter(word => word.length > 2);
    
    const commonWords = origWords.filter(word => 
      submWords.includes(word)
    );
    
    const similarity = commonWords.length / Math.max(origWords.length, submWords.length);
    const confidence = Math.round(similarity * 100);
    
    return {
      match: confidence >= 60,
      confidence
    };
  }

  verifyText(original, submitted) {
    const similarity = this.calculateSimilarity(original, submitted);
    const confidence = Math.round(similarity * 100);
    
    return {
      match: confidence >= 70,
      confidence
    };
  }

  verifyGeneric(original, submitted) {
    const similarity = this.calculateSimilarity(original, submitted);
    const confidence = Math.round(similarity * 100);
    
    return {
      match: confidence >= 80,
      confidence
    };
  }

  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
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

  generateSummary(results) {
    const totalFields = results.length;
    const matchedFields = results.filter(result => result.match).length;
    const averageConfidence = totalFields > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.confidence, 0) / totalFields)
      : 0;
    
    return {
      totalFields,
      matchedFields,
      averageConfidence,
      overallMatch: matchedFields >= Math.ceil(totalFields * 0.7) && averageConfidence >= 60
    };
  }
}

module.exports = new VerificationService();
