import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <motion.main 
        className="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
