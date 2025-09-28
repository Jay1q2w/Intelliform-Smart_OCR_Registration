import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DocumentUpload from '../components/forms/DocumentUpload';
import ExtractedDataForm from '../components/forms/ExtractedDataForm';
import { extractText, verifyData } from '../services/api';
import { Clock, FileText, TrendingUp } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileUpload = async (file) => {
    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await extractText(formData);
      
      if (response.success) {
        setDocumentData(response.data);
        setExtractedData(response.data.parsedData);
        setCurrentStep(2);
        
        toast.success(`Text extracted successfully! Confidence: ${response.data.confidence}%`);
      } else {
        throw new Error(response.message || 'Extraction failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to process document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDataSubmission = async (formData) => {
    setVerifyLoading(true);
    
    try {
      const verificationData = {
        documentId: documentData.documentId,
        submittedData: formData
      };
      
      const response = await verifyData(verificationData);
      
      if (response.success) {
        toast.success('Data verification completed!');
        navigate(`/verification/${documentData.documentId}`);
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify data');
    } finally {
      setVerifyLoading(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep(1);
    setDocumentData(null);
    setExtractedData(null);
    setUploadLoading(false);
    setVerifyLoading(false);
  };

  return (
    <div className="upload-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Document Processing</h1>
          <p>Upload your document to extract and verify data using advanced OCR technology</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="progress-steps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-icon">
              <FileText size={20} />
            </div>
            <span>Upload Document</span>
          </div>
          
          <div className="step-line" />
          
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-icon">
              <TrendingUp size={20} />
            </div>
            <span>Review & Edit</span>
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="step-content">
          {currentStep === 1 && (
            <motion.div
              className="upload-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DocumentUpload 
                onUpload={handleFileUpload} 
                loading={uploadLoading} 
              />
            </motion.div>
          )}

          {currentStep === 2 && extractedData && (
            <motion.div
              className="review-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="step-header">
                <div className="extraction-info">
                  <div className="info-card">
                    <Clock size={20} />
                    <div>
                      <span className="label">Processing Time</span>
                      <span className="value">{documentData.processingTime}ms</span>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <TrendingUp size={20} />
                    <div>
                      <span className="label">Confidence</span>
                      <span className="value">{documentData.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <FileText size={20} />
                    <div>
                      <span className="label">Words</span>
                      <span className="value">{documentData.wordCount}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={resetProcess}
                  className="reset-button"
                >
                  Upload New Document
                </button>
              </div>

              <ExtractedDataForm
                extractedData={extractedData}
                onSubmit={handleDataSubmission}
                loading={verifyLoading}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
