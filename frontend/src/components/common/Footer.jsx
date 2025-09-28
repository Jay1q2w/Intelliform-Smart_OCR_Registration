import React from 'react';
import { FileText, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <FileText size={24} />
              <span>OCR Verifier</span>
            </div>
            <p>Advanced OCR solution for text extraction and verification</p>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Text Extraction</li>
              <li>Data Verification</li>
              <li>Multi-format Support</li>
              <li>Real-time Processing</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="footer-links">
              <button 
                className="footer-link" 
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github size={18} />
                <span>GitHub</span>
              </button>
              <button 
                className="footer-link"
                onClick={() => window.location.href = 'mailto:contact@ocrverifier.com'}
              >
                <Mail size={18} />
                <span>Contact</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 OCR Verifier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
