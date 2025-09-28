const natural = require('natural');

class TextComparison {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.metaphone = natural.Metaphone;
    this.soundex = natural.Soundex;
    
    // Initialize distance algorithms
    this.levenshtein = natural.LevenshteinDistance;
    this.jaro = natural.JaroWinklerDistance;
    this.dice = natural.DiceCoefficient;
  }

  /**
   * Calculate comprehensive similarity score between two texts
   */
  calculateSimilarity(text1, text2, options = {}) {
    if (!text1 || !text2) return 0;

    const config = {
      caseSensitive: false,
      removeSpecialChars: true,
      stemming: false,
      phonetic: false,
      fuzzyMatching: true,
      weights: {
        exact: 0.4,
        levenshtein: 0.3,
        jaro: 0.2,
        dice: 0.1
      },
      ...options
    };

    // Normalize texts
    const normalizedText1 = this.normalizeText(text1, config);
    const normalizedText2 = this.normalizeText(text2, config);

    // Calculate different similarity scores
    const scores = {
      exact: this.exactMatch(normalizedText1, normalizedText2),
      levenshtein: this.levenshteinSimilarity(normalizedText1, normalizedText2),
      jaro: this.jaroWinklerSimilarity(normalizedText1, normalizedText2),
      dice: this.diceCoefficientSimilarity(normalizedText1, normalizedText2)
    };

    // Add phonetic similarity if enabled
    if (config.phonetic) {
      scores.phonetic = this.phoneticSimilarity(normalizedText1, normalizedText2);
      config.weights.phonetic = 0.15;
      // Adjust other weights
      Object.keys(config.weights).forEach(key => {
        if (key !== 'phonetic') {
          config.weights[key] *= 0.85;
        }
      });
    }

    // Calculate weighted average
    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(scores).forEach(key => {
      const weight = config.weights[key] || 0;
      totalScore += scores[key] * weight;
      totalWeight += weight;
    });

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      similarity: Math.round(finalScore * 100) / 100,
      confidence: Math.round(finalScore * 100),
      scores,
      details: {
        text1: normalizedText1,
        text2: normalizedText2,
        originalText1: text1,
        originalText2: text2
      }
    };
  }

  /**
   * Normalize text based on configuration
   */
  normalizeText(text, config) {
    if (!text) return '';

    let normalized = text;

    // Case normalization
    if (!config.caseSensitive) {
      normalized = normalized.toLowerCase();
    }

    // Remove special characters
    if (config.removeSpecialChars) {
      normalized = normalized.replace(/[^\w\s@.-]/g, '');
    }

    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Apply stemming
    if (config.stemming) {
      const tokens = this.tokenizer.tokenize(normalized);
      normalized = tokens.map(token => this.stemmer.stem(token)).join(' ');
    }

    return normalized;
  }

  /**
   * Exact match comparison
   */
  exactMatch(text1, text2) {
    return text1 === text2 ? 1 : 0;
  }

  /**
   * Levenshtein distance based similarity
   */
  levenshteinSimilarity(text1, text2) {
    if (text1 === text2) return 1;
    
    const maxLength = Math.max(text1.length, text2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshtein(text1, text2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Jaro-Winkler similarity
   */
  jaroWinklerSimilarity(text1, text2) {
    return this.jaro(text1, text2);
  }

  /**
   * Dice coefficient similarity
   */
  diceCoefficientSimilarity(text1, text2) {
    return this.dice(text1, text2);
  }

  /**
   * Phonetic similarity using Metaphone and Soundex
   */
  phoneticSimilarity(text1, text2) {
    const tokens1 = this.tokenizer.tokenize(text1);
    const tokens2 = this.tokenizer.tokenize(text2);

    let metaphoneMatches = 0;
    let soundexMatches = 0;
    let totalComparisons = 0;

    tokens1.forEach(token1 => {
      tokens2.forEach(token2 => {
        totalComparisons++;
        
        // Metaphone comparison
        if (this.metaphone.compare(token1, token2)) {
          metaphoneMatches++;
        }

        // Soundex comparison
        if (this.soundex.compare(token1, token2)) {
          soundexMatches++;
        }
      });
    });

    if (totalComparisons === 0) return 0;

    const metaphoneScore = metaphoneMatches / totalComparisons;
    const soundexScore = soundexMatches / totalComparisons;

    return (metaphoneScore + soundexScore) / 2;
  }

  /**
   * Advanced fuzzy matching with multiple algorithms
   */
  fuzzyMatch(text1, text2, threshold = 0.8) {
    const similarity = this.calculateSimilarity(text1, text2, {
      fuzzyMatching: true,
      phonetic: true
    });

    return {
      isMatch: similarity.similarity >= threshold,
      similarity: similarity.similarity,
      confidence: similarity.confidence,
      scores: similarity.scores
    };
  }

  /**
   * Find best match from array of candidates
   */
  findBestMatch(query, candidates, options = {}) {
    if (!candidates || candidates.length === 0) {
      return null;
    }

    const results = candidates.map((candidate, index) => ({
      index,
      candidate,
      ...this.calculateSimilarity(query, candidate, options)
    }));

    // Sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);

    return {
      bestMatch: results[0],
      allMatches: results,
      topMatches: results.slice(0, Math.min(5, results.length))
    };
  }

  /**
   * Email specific comparison
   */
  compareEmails(email1, email2) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email1) || !emailRegex.test(email2)) {
      return {
        similarity: 0,
        confidence: 0,
        isValid: false,
        reason: 'Invalid email format'
      };
    }

    const [localPart1, domain1] = email1.toLowerCase().split('@');
    const [localPart2, domain2] = email2.toLowerCase().split('@');

    // Domain must match exactly
    if (domain1 !== domain2) {
      return {
        similarity: 0,
        confidence: 0,
        isValid: true,
        reason: 'Different domains'
      };
    }

    // Compare local parts
    const localSimilarity = this.calculateSimilarity(localPart1, localPart2);

    return {
      similarity: localSimilarity.similarity,
      confidence: localSimilarity.confidence,
      isValid: true,
      reason: localSimilarity.similarity === 1 ? 'Exact match' : 'Similar local part'
    };
  }

  /**
   * Phone number comparison
   */
  comparePhoneNumbers(phone1, phone2) {
    // Normalize phone numbers by removing non-digits
    const normalized1 = phone1.replace(/\D/g, '');
    const normalized2 = phone2.replace(/\D/g, '');

    // Handle country codes
    const withoutCountry1 = this.removeCountryCode(normalized1);
    const withoutCountry2 = this.removeCountryCode(normalized2);

    if (withoutCountry1 === withoutCountry2) {
      return {
        similarity: 1,
        confidence: 100,
        reason: 'Numbers match (ignoring formatting and country code)'
      };
    }

    // Check if one number is contained in another (partial match)
    if (withoutCountry1.includes(withoutCountry2) || withoutCountry2.includes(withoutCountry1)) {
      return {
        similarity: 0.8,
        confidence: 80,
        reason: 'Partial number match'
      };
    }

    // Use Levenshtein for close matches
    const similarity = this.levenshteinSimilarity(withoutCountry1, withoutCountry2);
    
    return {
      similarity,
      confidence: Math.round(similarity * 100),
      reason: similarity > 0.7 ? 'Close match with possible typos' : 'Different numbers'
    };
  }

  /**
   * Remove common country codes
   */
  removeCountryCode(phoneNumber) {
    // Remove common country codes (US: +1, India: +91, UK: +44, etc.)
    const countryCodes = ['1', '91', '44', '33', '49', '81', '86'];
    
    for (const code of countryCodes) {
      if (phoneNumber.startsWith(code) && phoneNumber.length > code.length + 7) {
        return phoneNumber.substring(code.length);
      }
    }
    
    return phoneNumber;
  }

  /**
   * Date comparison with format flexibility
   */
  compareDates(date1, date2) {
    try {
      const parsedDate1 = this.parseFlexibleDate(date1);
      const parsedDate2 = this.parseFlexibleDate(date2);

      if (!parsedDate1 || !parsedDate2) {
        return {
          similarity: 0,
          confidence: 0,
          reason: 'Invalid date format'
        };
      }

      if (parsedDate1.getTime() === parsedDate2.getTime()) {
        return {
          similarity: 1,
          confidence: 100,
          reason: 'Exact date match'
        };
      }

      // Check if same date different format
      if (parsedDate1.toDateString() === parsedDate2.toDateString()) {
        return {
          similarity: 0.95,
          confidence: 95,
          reason: 'Same date, different time/format'
        };
      }

      // Calculate day difference for partial scoring
      const dayDiff = Math.abs(parsedDate1 - parsedDate2) / (1000 * 60 * 60 * 24);
      
      if (dayDiff <= 1) {
        return {
          similarity: 0.8,
          confidence: 80,
          reason: 'Dates within 1 day'
        };
      } else if (dayDiff <= 7) {
        return {
          similarity: 0.6,
          confidence: 60,
          reason: 'Dates within 1 week'
        };
      }

      return {
        similarity: 0,
        confidence: 0,
        reason: 'Different dates'
      };

    } catch (error) {
      return {
        similarity: 0,
        confidence: 0,
        reason: 'Date parsing error'
      };
    }
  }

  /**
   * Parse date with multiple format support
   */
  parseFlexibleDate(dateString) {
    if (!dateString) return null;

    // Try standard Date constructor first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    // Try common date formats
    const formats = [
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,  // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,  // YYYY/MM/DD
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})/   // MM/DD/YY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        const [, part1, part2, part3] = match;
        
        // Try different interpretations
        const interpretations = [
          new Date(part1, part2 - 1, part3), // MM/DD/YYYY
          new Date(part3, part1 - 1, part2), // DD/MM/YYYY
          new Date(part1, part2 - 1, part3)  // YYYY/MM/DD
        ];

        for (const interpretation of interpretations) {
          if (!isNaN(interpretation.getTime())) {
            return interpretation;
          }
        }
      }
    }

    return null;
  }

  /**
   * Address comparison with component analysis
   */
  compareAddresses(address1, address2) {
    const components1 = this.parseAddress(address1);
    const components2 = this.parseAddress(address2);

    const scores = {};
    let totalScore = 0;
    let componentCount = 0;

    // Compare each component
    ['street', 'city', 'state', 'zipcode'].forEach(component => {
      if (components1[component] && components2[component]) {
        const similarity = this.calculateSimilarity(
          components1[component], 
          components2[component]
        );
        scores[component] = similarity.similarity;
        totalScore += similarity.similarity;
        componentCount++;
      }
    });

    const averageScore = componentCount > 0 ? totalScore / componentCount : 0;

    return {
      similarity: averageScore,
      confidence: Math.round(averageScore * 100),
      componentScores: scores,
      reason: averageScore > 0.8 ? 'Address match' : 'Different addresses'
    };
  }

  /**
   * Basic address parsing
   */
  parseAddress(address) {
    if (!address) return {};

    const components = {};
    const addressParts = address.split(',').map(part => part.trim());

    // Very basic parsing - could be enhanced with more sophisticated NLP
    components.street = addressParts[0] || '';
    
    if (addressParts.length > 1) {
      components.city = addressParts[1] || '';
    }
    
    if (addressParts.length > 2) {
      const lastPart = addressParts[addressParts.length - 1];
      const zipMatch = lastPart.match(/\b\d{5}(-\d{4})?\b/);
      
      if (zipMatch) {
        components.zipcode = zipMatch[0];
        components.state = lastPart.replace(zipMatch[0], '').trim();
      } else {
        components.state = lastPart;
      }
    }

    return components;
  }

  /**
   * Get similarity threshold recommendations based on field type
   */
  getThresholdRecommendations(fieldType) {
    const thresholds = {
      email: { high: 0.95, medium: 0.85, low: 0.7 },
      phone: { high: 0.9, medium: 0.8, low: 0.6 },
      name: { high: 0.85, medium: 0.7, low: 0.5 },
      address: { high: 0.8, medium: 0.65, low: 0.5 },
      id: { high: 0.95, medium: 0.9, low: 0.8 },
      date: { high: 0.95, medium: 0.8, low: 0.6 },
      text: { high: 0.8, medium: 0.65, low: 0.5 }
    };

    return thresholds[fieldType] || thresholds.text;
  }
}

module.exports = new TextComparison();
