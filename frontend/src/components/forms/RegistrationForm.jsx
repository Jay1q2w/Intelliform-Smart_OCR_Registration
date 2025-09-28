import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit3, Check, User, Mail, Phone, MapPin, Calendar, Users, Home, Globe } from 'lucide-react';

const RegistrationForm = ({ extractedData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    name: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    address: '',
    phone: '',
    email: '',
    occupation: '',
    nationality: ''
  });

  const [editMode, setEditMode] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (extractedData) {
      console.log('Received extracted data:', extractedData);
      
      const mappedData = {
        firstName: extractedData.firstName || extractedData['first name'] || '',
        middleName: extractedData.middleName || extractedData['middle name'] || '',
        lastName: extractedData.lastName || extractedData['last name'] || extractedData.surname || '',
        name: extractedData.name || extractedData.fullName || '',
        gender: extractedData.gender || '',
        dateOfBirth: extractedData.dateOfBirth || extractedData.dob || '',
        age: extractedData.age || '',
        addressLine1: extractedData.addressLine1 || extractedData['address line 1'] || '',
        addressLine2: extractedData.addressLine2 || extractedData['address line 2'] || '',
        city: extractedData.city || '',
        state: extractedData.state || '',
        pinCode: extractedData.pinCode || extractedData.zip || '',
        address: extractedData.address || '',
        phone: extractedData.phone || extractedData.mobile || '',
        email: extractedData.email || extractedData.emailId || '',
        occupation: extractedData.occupation || '',
        nationality: extractedData.nationality || ''
      };
      
      // If full name exists but components don't, try to split
      if (mappedData.name && !mappedData.firstName && !mappedData.lastName) {
        const nameParts = mappedData.name.split(' ');
        if (nameParts.length >= 2) {
          mappedData.firstName = nameParts[0];
          if (nameParts.length === 3) {
            mappedData.middleName = nameParts[1];
            mappedData.lastName = nameParts[2];
          } else {
            mappedData.lastName = nameParts.slice(1).join(' ');
          }
        }
      }
      
      console.log('Mapped form data:', mappedData);
      setFormData(mappedData);
      
      // Auto-enable edit mode for empty fields
      const newEditMode = {};
      Object.keys(mappedData).forEach(key => {
        newEditMode[key] = !mappedData[key];
      });
      setEditMode(newEditMode);
    }
  }, [extractedData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update full name when name components change
    if (['firstName', 'middleName', 'lastName'].includes(field)) {
      const updatedData = { ...formData, [field]: value };
      const nameParts = [];
      if (updatedData.firstName) nameParts.push(updatedData.firstName);
      if (updatedData.middleName) nameParts.push(updatedData.middleName);
      if (updatedData.lastName) nameParts.push(updatedData.lastName);
      setFormData(prev => ({ ...prev, name: nameParts.join(' ') }));
    }
    
    // Update full address when address components change
    if (['addressLine1', 'addressLine2', 'city', 'state', 'pinCode'].includes(field)) {
      const updatedData = { ...formData, [field]: value };
      const addressParts = [];
      if (updatedData.addressLine1) addressParts.push(updatedData.addressLine1);
      if (updatedData.addressLine2) addressParts.push(updatedData.addressLine2);
      if (updatedData.city) addressParts.push(updatedData.city);
      if (updatedData.state) addressParts.push(updatedData.state);
      if (updatedData.pinCode) addressParts.push(updatedData.pinCode);
      setFormData(prev => ({ ...prev, address: addressParts.join(', ') }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleEditMode = (field) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create clean data object for submission
      const submissionData = {
        personalInfo: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          fullName: formData.name,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          age: formData.age,
          nationality: formData.nationality,
          occupation: formData.occupation
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email
        },
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          fullAddress: formData.address
        },
        metadata: {
          submittedAt: new Date().toISOString(),
          extractedFrom: 'OCR'
        }
      };
      
      onSubmit(submissionData);
    }
  };

  const formSections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text', required: true },
        { key: 'middleName', label: 'Middle Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text', required: true },
        { key: 'gender', label: 'Gender', type: 'select', options: ['', 'Male', 'Female', 'Other'] },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'age', label: 'Age', type: 'number', min: '1', max: '150' },
        { key: 'nationality', label: 'Nationality', type: 'text' },
        { key: 'occupation', label: 'Occupation', type: 'text' }
      ]
    },
    {
      title: 'Address Information',
      icon: Home,
      fields: [
        { key: 'addressLine1', label: 'Address Line 1', type: 'text', required: true },
        { key: 'addressLine2', label: 'Address Line 2', type: 'text' },
        { key: 'city', label: 'City', type: 'text', required: true },
        { key: 'state', label: 'State', type: 'text', required: true },
        { key: 'pinCode', label: 'Pin Code', type: 'text', required: true }
      ]
    },
    {
      title: 'Contact Information',
      icon: Phone,
      fields: [
        { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { key: 'email', label: 'Email ID', type: 'email', required: true }
      ]
    }
  ];

  const renderField = (field) => {
    const isEditing = editMode[field.key];
    const hasError = errors[field.key];
    const hasExtractedData = extractedData && extractedData[field.key];
    
    const getFieldIcon = (key) => {
      if (key.includes('name')) return User;
      if (key.includes('address') || key.includes('city') || key.includes('state') || key.includes('pin')) return MapPin;
      if (key === 'phone') return Phone;
      if (key === 'email') return Mail;
      if (key === 'dateOfBirth' || key === 'age') return Calendar;
      if (key === 'gender') return Users;
      if (key === 'nationality') return Globe;
      return User;
    };

    const FieldIcon = getFieldIcon(field.key);
    
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
            <FieldIcon size={18} />
            <span>{field.label} {field.required && <span className="required">*</span>}</span>
          </div>
          <button
            type="button"
            onClick={() => toggleEditMode(field.key)}
            className="edit-button"
            title={isEditing ? 'Save changes' : 'Edit field'}
          >
            {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
          </button>
        </label>
        
        <div className="field-input-container">
          {field.type === 'select' ? (
            <select
              value={formData[field.key]}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={`field-input ${isEditing ? 'editing' : ''}`}
              disabled={!isEditing}
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
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              readOnly={!isEditing}
              min={field.min}
              max={field.max}
            />
          )}
          
          {hasExtractedData && (
            <div className="extracted-indicator">
              <span>Auto-filled</span>
            </div>
          )}
        </div>
        
        {hasError && (
          <div className="field-error">{hasError}</div>
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
      <div className="extraction-debug">
        <details>
          <summary>Debug: Extracted Data</summary>
          <pre>{JSON.stringify(extractedData, null, 2)}</pre>
        </details>
      </div>
      
      <form className="registration-form" onSubmit={handleSubmit}>
        {formSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
          >
            <div className="section-header">
              <section.icon size={24} />
              <h3>{section.title}</h3>
            </div>
            <div className="section-fields">
              {section.fields.map(field => renderField(field))}
            </div>
          </motion.div>
        ))}

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <button
            type="submit"
            className="submit-button verified"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-content">
                <div className="spinner small" />
                <span>Verifying & Saving...</span>
              </div>
            ) : (
              <div className="button-content">
                <Save size={20} />
                <span>OK Verified</span>
              </div>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;
