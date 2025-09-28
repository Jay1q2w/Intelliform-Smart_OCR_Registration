import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import VerificationResults from '../components/forms/VerificationResults';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getVerificationResults } from '../services/api';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

const Verification = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerificationResults();
  }, [id]);

  const fetchVerificationResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getVerificationResults(id);
      
      if (response.success) {
        setVerificationData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch verification results');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to load verification results');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (results) => {
    const totalFields = results.length;
    const matchedFields = results.filter(r => r.match).length;
    const avgConfidence = Math.round(
      results.reduce((sum, r) => sum + r.confidence, 0) / totalFields
    );
    
    return {
      totalFields,
      matchedFields,
      averageConfidence: avgConfidence,
      overallMatch: matchedFields / totalFields >= 0.7
    };
  };

  const downloadResults = () => {
    if (!verificationData) return;
    
    const results = verificationData.verificationResults;
    const summary = calculateSummary(results);
    
    const data = {
      documentId: id,
      timestamp: new Date().toISOString(),
      summary,
      results: results.map(result => ({
        field: result.field,
        originalValue: result.originalValue,
        submittedValue: result.submittedValue,
        match: result.match,
        confidence: result.confidence,
        notes: result.notes
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-results-${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Verification results downloaded');
  };

  if (loading) {
    return (
      <div className="verification-page">
        <div className="container">
          <div className="loading-container">
            <LoadingSpinner size={50} />
            <p>Loading verification results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-page">
        <div className="container">
          <motion.div
            className="error-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="error-content">
              <h2>Error Loading Results</h2>
              <p>{error}</p>
              <div className="error-actions">
                <button 
                  onClick={fetchVerificationResults}
                  className="retry-button"
                >
                  <RefreshCw size={20} />
                  Retry
                </button>
                <Link to="/upload" className="back-button">
                  <ArrowLeft size={20} />
                  Back to Upload
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!verificationData || !verificationData.verificationResults) {
    return (
      <div className="verification-page">
        <div className="container">
          <motion.div
            className="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>No Verification Results Found</h2>
            <p>The document may not have been verified yet.</p>
            <Link to="/upload" className="back-button">
              <ArrowLeft size={20} />
              Back to Upload
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const results = verificationData.verificationResults;
  const summary = calculateSummary(results);

  return (
    <div className="verification-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div className="title-section">
              <h1>Verification Results</h1>
              <p>Document ID: {id}</p>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={downloadResults}
                className="download-button"
              >
                <Download size={20} />
                Download Results
              </button>
              
              <Link to="/upload" className="back-button">
                <ArrowLeft size={20} />
                New Document
              </Link>
            </div>
          </div>
        </motion.div>

        <VerificationResults 
          results={results} 
          summary={summary}
        />
        
        <motion.div
          className="page-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="footer-actions">
            <Link to="/upload" className="cta-button secondary">
              Process Another Document
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Verification;
