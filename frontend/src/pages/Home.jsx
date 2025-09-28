import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: 'Smart OCR Extraction',
      description: 'Advanced OCR technology extracts text from PDFs, images, and scanned documents with high accuracy.'
    },
    {
      icon: Shield,
      title: 'Data Verification',
      description: 'Intelligent verification system compares extracted data with submitted information for accuracy.'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Lightning-fast document processing with real-time feedback and confidence scoring.'
    },
    {
      icon: Globe,
      title: 'Multi-format Support',
      description: 'Supports multiple document formats including PDF, JPEG, PNG, and various image types.'
    }
  ];

  const stats = [
    { value: '99%', label: 'Accuracy Rate' },
    { value: '<2s', label: 'Processing Time' },
    { value: '50+', label: 'Document Types' },
    { value: '24/7', label: 'Availability' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1>Advanced OCR Solution for Text Extraction & Verification</h1>
              <p>
                Transform your document processing workflow with our intelligent OCR system. 
                Extract text from any document and verify data accuracy with confidence.
              </p>
              <div className="hero-actions">
                <Link to="/upload" className="cta-button primary">
                  <Upload size={20} />
                  Start Processing
                  <ArrowRight size={18} />
                </Link>
                <a href="#features" className="cta-button secondary">
                  Learn More
                </a>
              </div>
            </motion.div>
            
            <motion.div
              className="hero-visual"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="visual-card">
                <div className="card-header">
                  <FileText size={24} />
                  <span>Document Analysis</span>
                </div>
                <div className="progress-bars">
                  <div className="progress-item">
                    <span>Text Extraction</span>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '95%' }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </div>
                  </div>
                  <div className="progress-item">
                    <span>Data Verification</span>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 2, delay: 1.5 }}
                      />
                    </div>
                  </div>
                  <div className="progress-item">
                    <span>Confidence Score</span>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 2, delay: 2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="stats-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Powerful Features</h2>
            <p>Everything you need for efficient document processing and verification</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="feature-icon">
                  <feature.icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section 
        className="process-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple three-step process to extract and verify your document data</p>
          </div>

          <div className="process-steps">
            {[
              {
                step: 1,
                icon: Upload,
                title: 'Upload Document',
                description: 'Upload your PDF, image, or scanned document to our secure platform.'
              },
              {
                step: 2,
                icon: FileText,
                title: 'Extract Data',
                description: 'Our advanced OCR engine processes your document and extracts structured data.'
              },
              {
                step: 3,
                icon: CheckCircle,
                title: 'Verify & Validate',
                description: 'Review extracted data and run verification to ensure accuracy and completeness.'
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                className="process-step"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="step-number">{process.step}</div>
                <div className="step-content">
                  <div className="step-icon">
                    <process.icon size={28} />
                  </div>
                  <h3>{process.title}</h3>
                  <p>{process.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Process Your Documents?</h2>
            <p>Start extracting and verifying your document data with our advanced OCR solution.</p>
            <Link to="/upload" className="cta-button primary large">
              <Upload size={24} />
              Upload Document
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
