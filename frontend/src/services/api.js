import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    console.error('API error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText || 'Server error';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Network error
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Request setup error
      return Promise.reject(new Error(error.message || 'Request failed'));
    }
  }
);

// Test API connection
export const testConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/test');
    console.log('API test successful:', response);
    return response;
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
};

// OCR API endpoints
export const extractText = async (formData) => {
  try {
    console.log('Sending file for OCR extraction...');
    console.log('FormData contents:', Array.from(formData.entries()));
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120 seconds for OCR processing
    };
    
    const response = await api.post('/ocr/extract', formData, config);
    console.log('OCR extraction successful:', response);
    return response;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw error;
  }
};

export const getDocument = async (documentId) => {
  return await api.get(`/ocr/document/${documentId}`);
};

export const getAllDocuments = async (page = 1, limit = 10) => {
  return await api.get(`/ocr/documents?page=${page}&limit=${limit}`);
};

export const deleteDocument = async (documentId) => {
  return await api.delete(`/ocr/document/${documentId}`);
};

// Verification API endpoints
// Update the verification API call
export const verifyAndSaveRegistration = async (verificationData) => {
  try {
    console.log('Sending verification data:', verificationData);
    const response = await api.post('/verification/register', verificationData);
    console.log('Verification response:', response);
    return response;
  } catch (error) {
    console.error('Verification API error:', error);
    throw error;
  }
};

export const getRegistration = async (registrationId) => {
  return await api.get(`/verification/registration/${registrationId}`);
};

export const getAllRegistrations = async (page = 1, limit = 10) => {
  return await api.get(`/verification/registrations?page=${page}&limit=${limit}`);
};

export const searchRegistrations = async (query, field = null) => {
  const params = new URLSearchParams({ query });
  if (field) params.append('field', field);
  return await api.get(`/verification/search?${params}`);
};


export default api;
