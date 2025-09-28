import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit3, Check } from 'lucide-react';

const ExtractedDataForm = ({ extractedData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    if (extractedData) {
      setFormData(extractedData);
    }
  }, [extractedData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEditMode = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (key, value) => {
    const isEditing = editMode[key];
    
    return (
      <motion.div
        key={key}
        className="form-field"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="field-label">
          <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
          <button
            type="button"
            onClick={() => toggleEditMode(key)}
            className="edit-button"
          >
            {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
          </button>
        </label>
        
        {isEditing ? (
          <input
            type="text"
            value={formData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="field-input editing"
            autoFocus
            onBlur={() => toggleEditMode(key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                toggleEditMode(key);
              }
              if (e.key === 'Escape') {
                setFormData(prev => ({
                  ...prev,
                  [key]: value
                }));
                toggleEditMode(key);
              }
            }}
          />
        ) : (
          <div className="field-display">
            <input
              type="text"
              value={formData[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="field-input"
              readOnly={!isEditing}
            />
          </div>
        )}
      </motion.div>
    );
  };

  if (!extractedData || Object.keys(extractedData).length === 0) {
    return (
      <div className="no-data">
        <p>No extracted data available</p>
      </div>
    );
  }

  return (
    <motion.form
      className="extracted-data-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <h3>Extracted Data</h3>
        <p>Review and edit the extracted information before verification</p>
      </div>

      <div className="form-fields">
        {Object.entries(extractedData).map(([key, value]) => 
          key !== 'rawText' ? renderField(key, value) : null
        )}
        
        {extractedData.rawText && (
          <motion.div
            className="form-field raw-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label className="field-label">Raw Extracted Text</label>
            <textarea
              value={extractedData.rawText}
              readOnly
              className="field-textarea"
              rows={6}
            />
          </motion.div>
        )}
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
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="button-content">
              <Save size={20} />
              <span>Verify Data</span>
            </div>
          )}
        </button>
      </motion.div>
    </motion.form>
  );
};

export default ExtractedDataForm;
