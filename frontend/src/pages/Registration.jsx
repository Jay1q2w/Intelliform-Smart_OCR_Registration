import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DocumentUpload from '../components/forms/DocumentUpload';
import RegistrationForm from '../components/forms/RegistrationForm';
import VerificationResults from '../components/forms/VerificationResults';
import { extractText, verifyData } from '../services/api';
import { Upload, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { verifyAndSaveRegistration } from '../services/api';

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);

  const handleFileUpload = async (file) => {
    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await extractText(formData);
      
      if (response.success) {
        setExtractedData(response.data.parsedData);
        setDocumentId(response.data.documentId);
        setCurrentStep(2);
        
        toast.success(`Document processed successfully! Confidence: ${response.data.confidence}%`);
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

const handleFormSubmission = async (formData) => {
  setVerifyLoading(true);
  
  try {
    const verificationData = {
      documentId: documentId,
      submittedData: formData
    };
    
    const response = await verifyAndSaveRegistration(verificationData);
    
    if (response.success) {
      setVerificationResults({
        results: response.data.verificationResults,
        summary: response.data.summary,
        registrationId: response.data.registrationId
      });
      setCurrentStep(3);
      toast.success('Registration verified and saved successfully!');
    } else {
      throw new Error(response.message || 'Verification failed');
    }
  } catch (error) {
    console.error('Verification error:', error);
    toast.error(error.message || 'Failed to verify and save registration');
  } finally {
    setVerifyLoading(false);
  }
};

  const resetProcess = () => {
    setCurrentStep(1);
    setExtractedData(null);
    setDocumentId(null);
    setVerificationResults(null);
    setUploadLoading(false);
    setVerifyLoading(false);
  };

  const steps = [
    { number: 1, title: 'Upload Document', icon: Upload, description: 'Upload ID card, form, or document' },
    { number: 2, title: 'Fill Registration', icon: FileText, description: 'Review and complete form data' },
    { number: 3, title: 'Verify Data', icon: CheckCircle, description: 'Validate form against document' }
  ];

  return (
    <div className="registration-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Registration Form</h1>
          <p>Upload your document to auto-populate the registration form with OCR technology</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="progress-steps-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="progress-steps">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                  <div className="step-icon">
                    <step.icon size={20} />
                  </div>
                  <div className="step-content">
                    <span className="step-title">{step.title}</span>
                    <span className="step-description">{step.description}</span>
                  </div>
                </div>
                {index < steps.length - 1 && <div className="step-line" />}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="step-content-container">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="upload"
                className="upload-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="step-info">
                  <h2>Upload Your Document</h2>
                  <p>Upload an ID card, registration form, or any document containing personal information. Our OCR system will extract the data and auto-populate the registration form.</p>
                  <ul>
                    <li> Supports PDF, JPG, PNG formats</li>
                    <li> Automatic data extraction</li>
                    <li> High accuracy OCR processing</li>
                    <li> Secure document handling</li>
                  </ul>
                </div>
                <DocumentUpload 
                  onUpload={handleFileUpload} 
                  loading={uploadLoading} 
                />
              </motion.div>
            )}

            {currentStep === 2 && extractedData && (
              <motion.div
                key="form"
                className="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="step-header">
                  <h2>Registration Form</h2>
                  <p>Review and complete the auto-populated form data extracted from your document</p>
                  <button 
                    onClick={resetProcess}
                    className="reset-button"
                  >
                    <RefreshCw size={16} />
                    Upload New Document
                  </button>
                  <p>     </p>
                  <p>     </p>
                </div>

                <RegistrationForm
                  extractedData={extractedData}
                  onSubmit={handleFormSubmission}
                  loading={verifyLoading}
                />
              </motion.div>
            )}

            {currentStep === 3 && verificationResults && (
              <motion.div
                key="verification"
                className="verification-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="step-header">
                  <h2>Verification Results</h2>
                  <p>Data verification completed. Review the accuracy of your submitted information.</p>
                  <button 
                    onClick={resetProcess}
                    className="reset-button"
                  >
                    <RefreshCw size={16} />
                    New Registration
                  </button>
                </div>

                <VerificationResults 
                  results={verificationResults.results} 
                  summary={verificationResults.summary}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Registration;
