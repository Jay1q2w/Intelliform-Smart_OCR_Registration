import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Database,
  FileUp,
  CheckSquare,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  BarChart3,
  Settings,
  Users
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Database,
      title: 'Advanced OCR Engine',
      description: 'OCR technology with text extraction from any document format.'
    },
    {
      icon: Shield,
      title: 'Data Verification',
      description: 'Multi-layer verification system ensures data accuracy and integrity with confidence scoring.'
    },
    {
      icon: Globe,
      title: 'Multi-Format Support',
      description: 'Process PDFs, images, handwritten documents, and various enterprise document formats.'
    }
  ];

  const stats = [
    { value: '92+ %', label: 'Accuracy Rate', icon: BarChart3 },
    { value: '<4s', label: 'Processing Time', icon: Zap },
    { value: '10+', label: 'Document Types', icon: Database },
  ];

  return (
    <div className="home-page">
      {/* Hero Section with Metallic Grey */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container">
          {/* Use the same page-header class for consistency */}
          <div className="page-header">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1>Smart Registration</h1>
              <p>
                Professional document processing with OCR technology.<br />
                Extract, verify, and Autofill form data with accuracy and security.
              </p>
              <div className="hero-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/registration" className="btn btn-primary btn-large">
                  <FileUp size={20} />
                  Start Processing
                  <ArrowRight size={18} />
                </Link>
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
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{ padding: '4rem 0' }}
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="card"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center' }}
              >
                <div className="card-body">
                  <stat.icon size={32} style={{ color: 'var(--text-accent)', marginBottom: '1rem' }} />
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.875rem' }}>
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <motion.div
            style={{ textAlign: 'center', marginBottom: '3rem' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Enterprise Features
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Built for enterprise workflows with advanced security, scalability, and integration capabilities.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '64px', 
                    height: '64px',
                    background: 'var(--chrome-gradient)',
                    borderRadius: '1rem',
                    marginBottom: '1.5rem',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <feature.icon size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        style={{ padding: '4rem 0', textAlign: 'center' }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
