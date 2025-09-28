/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format processing time
 */
export const formatProcessingTime = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = (milliseconds / 1000).toFixed(2);
  return `${seconds}s`;
};

/**
 * Get confidence color based on percentage
 */
export const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return '#10B981'; // Green
  if (confidence >= 80) return '#34D399'; // Light green
  if (confidence >= 70) return '#FCD34D'; // Yellow
  if (confidence >= 60) return '#F59E0B'; // Orange
  if (confidence >= 50) return '#F97316'; // Dark orange
  return '#EF4444'; // Red
};

/**
 * Get confidence status text
 */
export const getConfidenceStatus = (confidence) => {
  if (confidence >= 90) return 'Excellent';
  if (confidence >= 80) return 'Very Good';
  if (confidence >= 70) return 'Good';
  if (confidence >= 60) return 'Fair';
  if (confidence >= 50) return 'Poor';
  return 'Very Poor';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Extract field type from field name
 */
export const getFieldType = (fieldName) => {
  const name = fieldName.toLowerCase();
  
  if (name.includes('email') || name.includes('mail')) return 'email';
  if (name.includes('phone') || name.includes('tel') || name.includes('mobile')) return 'phone';
  if (name.includes('date') || name.includes('birth') || name.includes('dob')) return 'date';
  if (name.includes('url') || name.includes('website') || name.includes('link')) return 'url';
  if (name.includes('number') || name.includes('id') || name.includes('ssn')) return 'number';
  if (name.includes('address') || name.includes('location')) return 'address';
  
  return 'text';
};

/**
 * Clean and normalize text for comparison
 */
export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s@.-]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Generate random color for charts/visualizations
 */
export const generateColor = (index) => {
  const colors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  return colors[index % colors.length];
};

/**
 * Debounce function for search/input delays
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
};

/**
 * Convert object to URL query string
 */
export const objectToQueryString = (obj) => {
  const params = new URLSearchParams();
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined) {
      params.append(key, obj[key]);
    }
  });
  return params.toString();
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file type is supported
 */
export const isSupportedFileType = (filename, mimetype) => {
  const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  const supportedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ];
  
  const extension = getFileExtension(filename).toLowerCase();
  
  return supportedExtensions.includes(extension) && 
         supportedMimeTypes.includes(mimetype);
};

/**
 * Generate UUID v4
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Convert camelCase to readable text
 */
export const camelCaseToReadable = (str) => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Create toast notification helper
 */
export const createToast = (type, message, options = {}) => {
  return {
    type,
    message,
    duration: options.duration || 4000,
    id: generateUUID(),
    ...options
  };
};

/**
 * Format confidence percentage
 */
export const formatConfidence = (confidence) => {
  return `${Math.round(confidence)}%`;
};

/**
 * Calculate processing speed (words per second)
 */
export const calculateProcessingSpeed = (wordCount, processingTime) => {
  const seconds = processingTime / 1000;
  return Math.round(wordCount / seconds);
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    'uploaded': '#6B7280',
    'processing': '#3B82F6',
    'processed': '#10B981',
    'verified': '#059669',
    'error': '#EF4444',
    'failed': '#DC2626'
  };
  return colors[status] || '#6B7280';
};
