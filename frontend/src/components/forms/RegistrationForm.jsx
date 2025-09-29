import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit3, Check, User, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';

// +++ 1. ADD THIS HELPER FUNCTION +++
// This function converts a date string (like "13 Jul 2006") into "YYYY-MM-DD"
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return ''; // Return empty if date is not parsable
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const RegistrationForm = ({ extractedData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: '',
    emergencyContact: '',
    nationality: ''
  });

  const [editMode, setEditMode] = useState({});
  const [errors, setErrors] = useState({});

  // Auto-populate form with extracted data
  useEffect(() => {
    if (extractedData) {
      const dobFromData = extractedData.dateOfBirth || extractedData.dob || extractedData.birthDate || '';

      const mappedData = {
        name: extractedData.name || extractedData.fullName || extractedData['full name'] || '',
        age: extractedData.age || '',
        gender: extractedData.gender || '',
        address: extractedData.address || '',
        email: extractedData.email || extractedData.emailId || extractedData['email id'] || '',
        phone: extractedData.phone || extractedData.mobile || extractedData.phoneNumber || extractedData['phone number'] || '',
        // +++ 2. USE THE HELPER FUNCTION HERE +++
        dateOfBirth: formatDateForInput(dobFromData),
        occupation: extractedData.occupation || extractedData.job || '',
        emergencyContact: extractedData.emergencyContact || extractedData.emergency || '',
        nationality: extractedData.nationality || extractedData.country || ''
      };
      
      setFormData(mappedData);
    }
  }, [extractedData]);

  // ... (The rest of your component remains exactly the same)
  // handleInputChange, toggleEditMode, validateForm, handleSubmit, formFields, renderField etc.
  // No other changes are needed below this line.
// The rest of your file...

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleEditMode = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formFields = [
    {
      key: 'name',
      label: 'Full Name',
      icon: User,
      type: 'text',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      key: 'age',
      label: 'Age',
      icon: Calendar,
      type: 'number',
      placeholder: 'Enter your age'
    },
    {
      key: 'gender',
      label: 'Gender',
      icon: Users,
      type: 'select',
      options: ['', 'Male', 'Female', 'Other'],
      placeholder: 'Select gender'
    },
    {
      key: 'email',
      label: 'Email ID',
      icon: Mail,
      type: 'email',
      required: true,
      placeholder: 'Enter your email address'
    },
    {
      key: 'phone',
      label: 'Phone Number',
      icon: Phone,
      type: 'tel',
      required: true,
      placeholder: 'Enter your phone number'
    },
    {
      key: 'address',
      label: 'Address',
      icon: MapPin,
      type: 'textarea',
      required: true,
      placeholder: 'Enter your complete address'
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      icon: Calendar,
      type: 'date',
      placeholder: 'Select your date of birth'
    },
    {
      key: 'occupation',
      label: 'Occupation',
      icon: User,
      type: 'text',
      placeholder: 'Enter your occupation'
    },
    {
      key: 'emergencyContact',
      label: 'Emergency Contact',
      icon: Phone,
      type: 'tel',
      placeholder: 'Enter emergency contact number'
    },
    {
      key: 'nationality',
      label: 'Nationality',
      icon: User,
      type: 'text',
      placeholder: 'Enter your nationality'
    }
  ];

  const renderField = (field) => {
    const isEditing = editMode[field.key];
    const hasError = errors[field.key];
    const hasExtractedData = extractedData && (extractedData[field.key] || (field.key === 'dateOfBirth' && (extractedData.dob || extractedData.birthDate)));
    
    return (
      <motion.div
        key={field.key}
        className={`form-field ${hasError ? 'error' : ''} ${hasExtractedData ? 'auto-filled' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="field-label">
          <div className="label-content">
            <field.icon size={18} />
            <span>{field.label} {field.required && <span className="required">*</span>}</span>
          </div>
          {hasExtractedData && (
            <button
              type="button"
              onClick={() => toggleEditMode(field.key)}
              className="edit-button"
              title={isEditing ? 'Save changes' : 'Edit field'}
            >
              {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
            </button>
          )}
        </label>
        
        <div className="field-input-container">
          {field.type === 'textarea' ? (
            <textarea
              value={formData[field.key]}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={`field-input ${isEditing ? 'editing' : ''}`}
              placeholder={field.placeholder}
              rows={3}
              readOnly={hasExtractedData && !isEditing}
            />
          ) : field.type === 'select' ? (
            <select
              value={formData[field.key]}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={`field-input ${isEditing ? 'editing' : ''}`}
              disabled={hasExtractedData && !isEditing}
            >
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={formData[field.key]}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={`field-input ${isEditing ? 'editing' : ''}`}
              placeholder={field.placeholder}
              readOnly={hasExtractedData && !isEditing}
            />
          )}
          
          {hasExtractedData && (
            <div className="extracted-indicator">
              <span>Auto-filled from document</span>
            </div>
          )}
        </div>
        
        {hasError && (
          <div className="field-error">
            {hasError}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      className="registration-form-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {formFields.map(field => renderField(field))}
        </div>

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-content">
                <div className="spinner small" />
                <span>Verifying Registration...</span>
              </div>
            ) : (
              <div className="button-content">
                <Save size={20} />
                <span>Submit & Verify Registration</span>
              </div>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;