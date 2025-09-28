import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 40, color = "#4F46E5" }) => {
  return (
    <div className="loading-spinner">
      <motion.div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: `3px solid rgba(79, 70, 229, 0.1)`,
          borderTop: `3px solid ${color}`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default LoadingSpinner;
