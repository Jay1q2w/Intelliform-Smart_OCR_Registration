import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Award,
  AlertCircle
} from 'lucide-react';

const VerificationResults = ({ results, summary, registrationId }) => {
  const getStatusIcon = (match, confidence) => {
    if (match) {
      return <CheckCircle className="status-icon success" size={24} />;
    } else if (confidence > 50) {
      return <AlertTriangle className="status-icon warning" size={24} />;
    } else {
      return <XCircle className="status-icon error" size={24} />;
    }
  };

  const getStatusClass = (match, confidence) => {
    if (match) return 'success';
    if (confidence > 50) return 'warning';
    return 'error';
  };

  const getFieldIcon = (fieldName) => {
    const field = fieldName.toLowerCase();
    if (field.includes('name')) return User;
    if (field.includes('email')) return Mail;
    if (field.includes('phone')) return Phone;
    if (field.includes('address') || field.includes('city') || field.includes('state') || field.includes('pin')) return MapPin;
    if (field.includes('date') || field.includes('age')) return Calendar;
    if (field.includes('nationality')) return Globe;
    return FileText;
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <motion.div
      className="verification-results-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Results Header */}
      <div className="verification-header">
        <motion.div
          className="header-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-icon">
            <Award size={32} />
          </div>
          <div className="header-text">
            <h2>Verification Complete</h2>
            <p>Data verification and validation results</p>
            {registrationId && (
              <div className="registration-id">
                <span>Registration ID: </span>
                <code>{registrationId}</code>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <motion.div
          className="summary-card primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card-icon">
            <CheckCircle size={28} />
          </div>
          <div className="card-content">
            <div className="card-value">{summary.matchedFields}/{summary.totalFields}</div>
            <div className="card-label">Fields Matched</div>
          </div>
        </motion.div>

        <motion.div
          className="summary-card secondary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card-icon">
            <TrendingUp size={28} />
          </div>
          <div className="card-content">
            <div className="card-value">{summary.averageConfidence}%</div>
            <div className="card-label">Average Confidence</div>
          </div>
        </motion.div>

        <motion.div
          className={`summary-card ${summary.overallMatch ? 'success' : 'warning'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card-icon">
            {summary.overallMatch ? <Award size={28} /> : <AlertCircle size={28} />}
          </div>
          <div className="card-content">
            <div className="card-value">
              {summary.overallMatch ? 'VERIFIED' : 'REVIEW'}
            </div>
            <div className="card-label">Status</div>
          </div>
        </motion.div>
      </div>

      {/* Overall Status Banner */}
      <motion.div
        className={`status-banner ${summary.overallMatch ? 'success' : 'warning'}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="banner-icon">
          {summary.overallMatch ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div className="banner-content">
          <h3>
            {summary.overallMatch 
              ? 'Verification Successful' 
              : 'Verification Requires Review'}
          </h3>
          <p>
            {summary.overallMatch 
              ? 'All critical fields have been verified and data integrity is confirmed.'
              : 'Some fields require manual review. Please check the details below.'}
          </p>
        </div>
      </motion.div>

      {/* Detailed Results */}
      <div className="detailed-results">
        <div className="results-header">
          <h3>Field-by-Field Analysis</h3>
          <p>Detailed verification results for each submitted field</p>
        </div>

        <div className="results-grid">
          {results.map((result, index) => {
            const FieldIcon = getFieldIcon(result.field);
            const statusClass = getStatusClass(result.match, result.confidence);
            
            return (
              <motion.div
                key={index}
                className={`result-card ${statusClass}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="result-header">
                  <div className="field-info">
                    <div className="field-icon">
                      <FieldIcon size={20} />
                    </div>
                    <div className="field-details">
                      <h4>{formatFieldName(result.field)}</h4>
                      <span className="field-type">{result.fieldType || 'text'}</span>
                    </div>
                  </div>
                  <div className="status-indicator">
                    {getStatusIcon(result.match, result.confidence)}
                  </div>
                </div>

                <div className="result-content">
                  <div className="confidence-section">
                    <div className="confidence-label">Confidence Score</div>
                    <div className="confidence-display">
                      <div className="confidence-bar">
                        <motion.div 
                          className="confidence-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 + 0.5 }}
                          style={{
                            backgroundColor: result.confidence >= 80 ? '#28a745' : 
                                           result.confidence >= 60 ? '#ffc107' : '#dc3545'
                          }}
                        />
                      </div>
                      <span className="confidence-value">{result.confidence}%</span>
                    </div>
                  </div>

                  <div className="value-comparison">
                    <div className="value-row">
                      <div className="value-label">Original (OCR)</div>
                      <div className="value-content original">
                        {result.originalValue || <em>Not detected</em>}
                      </div>
                    </div>
                    <div className="value-row">
                      <div className="value-label">Submitted</div>
                      <div className="value-content submitted">
                        {result.submittedValue}
                      </div>
                    </div>
                  </div>

                  {result.notes && (
                    <div className="result-notes">
                      <div className="notes-label">Analysis</div>
                      <div className="notes-content">{result.notes}</div>
                    </div>
                  )}

                  <div className="result-metadata">
                    <Clock size={14} />
                    <span>{new Date(result.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        className="statistics-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="statistics-header">
          <h3>Verification Statistics</h3>
        </div>
        <div className="statistics-grid">
          <div className="stat-item">
            <div className="stat-value">{summary.totalFields}</div>
            <div className="stat-label">Total Fields</div>
          </div>
          <div className="stat-item success">
            <div className="stat-value">{summary.matchedFields}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-item error">
            <div className="stat-value">{summary.totalFields - summary.matchedFields}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Math.round((summary.matchedFields / summary.totalFields) * 100)}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VerificationResults;
