import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const VerificationResults = ({ results, summary }) => {
  const getStatusIcon = (match, confidence) => {
    if (match) {
      return <CheckCircle className="status-icon success" size={20} />;
    } else if (confidence > 50) {
      return <AlertTriangle className="status-icon warning" size={20} />;
    } else {
      return <XCircle className="status-icon error" size={20} />;
    }
  };

  const getStatusClass = (match, confidence) => {
    if (match) return 'success';
    if (confidence > 50) return 'warning';
    return 'error';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10B981';
    if (confidence >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <motion.div
      className="verification-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results-header">
        <h3>Verification Results</h3>
        <div className="summary-stats">
          <div className="stat">
            <CheckCircle size={20} />
            <span>{summary.matchedFields}/{summary.totalFields} fields matched</span>
          </div>
          <div className="stat">
            <TrendingUp size={20} />
            <span>{summary.averageConfidence}% average confidence</span>
          </div>
        </div>
      </div>

      <div className="overall-status">
        <div className={`status-card ${summary.overallMatch ? 'success' : 'warning'}`}>
          {summary.overallMatch ? (
            <>
              <CheckCircle size={24} />
              <span>Verification Passed</span>
            </>
          ) : (
            <>
              <AlertTriangle size={24} />
              <span>Verification Needs Review</span>
            </>
          )}
        </div>
      </div>

      <div className="results-list">
        {results.map((result, index) => (
          <motion.div
            key={index}
            className={`result-item ${getStatusClass(result.match, result.confidence)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="result-header">
              <div className="field-info">
                {getStatusIcon(result.match, result.confidence)}
                <span className="field-name">
                  {result.field.charAt(0).toUpperCase() + 
                   result.field.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
              </div>
              <div className="confidence-badge">
                <div 
                  className="confidence-bar"
                  style={{ 
                    width: `${result.confidence}%`,
                    backgroundColor: getConfidenceColor(result.confidence)
                  }}
                />
                <span>{result.confidence}%</span>
              </div>
            </div>

            <div className="result-content">
              <div className="value-comparison">
                <div className="value-row">
                  <span className="label">Original:</span>
                  <span className="value original">{result.originalValue || 'N/A'}</span>
                </div>
                <div className="value-row">
                  <span className="label">Submitted:</span>
                  <span className="value submitted">{result.submittedValue}</span>
                </div>
              </div>

              {result.notes && (
                <div className="result-notes">
                  <span>{result.notes}</span>
                </div>
              )}

              <div className="result-meta">
                <span className="timestamp">
                  <Clock size={14} />
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
                {result.similarity && (
                  <span className="similarity">
                    Similarity: {Math.round(result.similarity * 100)}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="results-summary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h4>Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Fields</span>
            <span className="summary-value">{summary.totalFields}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Matched Fields</span>
            <span className="summary-value success">{summary.matchedFields}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Failed Fields</span>
            <span className="summary-value error">{summary.totalFields - summary.matchedFields}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Confidence</span>
            <span className="summary-value">{summary.averageConfidence}%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VerificationResults;
