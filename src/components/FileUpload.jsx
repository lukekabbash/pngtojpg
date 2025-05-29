import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../App';

const FileUpload = ({ onFileSelect, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { isDarkMode } = useTheme();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const supportedFiles = files.filter(file => 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' || 
      file.type === 'image/webp'
    );
    
    if (supportedFiles.length > 0) {
      onFileSelect(supportedFiles[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file && (
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' || 
      file.type === 'image/webp'
    )) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <motion.div
        className={`border-4 border-dashed p-8 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-red-800 bg-red-100 dark:bg-red-950/30' 
            : isDarkMode 
              ? 'border-gray-700 bg-gray-800 hover:border-red-800' 
              : 'border-gray-400 bg-white hover:border-red-800'
        }`}
        animate={{
          scale: isDragOver ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          animate={{
            scale: isDragOver ? 1.1 : 1,
            rotate: isDragOver ? 5 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <svg
            className={`w-20 h-20 mx-auto ${
              isDragOver ? 'text-red-800' : 'text-red-800'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </motion.div>

        <h3 className={`text-3xl font-black mb-4 font-times uppercase tracking-wider ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>
          {isDragOver ? 'Drop Image Here!' : 'Upload Image'}
        </h3>
        
        <p className={`mb-8 font-times font-semibold text-lg ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Drag and drop your image file here, or click to browse
        </p>

        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
          />
          <span className={`inline-block font-bold py-4 px-10 cursor-pointer transition-all duration-200 shadow-lg font-times uppercase tracking-wider border-2 ${
            isProcessing 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed border-gray-500' 
              : 'bg-red-800 hover:bg-red-900 text-white border-red-800 hover:border-red-900'
          }`}>
            {isProcessing ? 'Processing...' : 'Choose File'}
          </span>
        </motion.label>

        <div className={`mt-8 text-sm font-times font-semibold uppercase tracking-wide ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p>• Supports PNG, JPEG, and WebP files</p>
          <p>• PNG/JPEG: Convert to optimized JPG</p>
          <p>• WebP: Crop only (no compression)</p>
          <p>• Smart cropping with aspect ratio options</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUpload; 