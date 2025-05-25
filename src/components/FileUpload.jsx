import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const FileUpload = ({ onFileSelect, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
    const pngFiles = files.filter(file => file.type === 'image/png');
    
    if (pngFiles.length > 0) {
      onFileSelect(pngFiles[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
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
      <div className="gradient-border">
        <motion.div
          className="gradient-border-inner p-8 text-center"
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
              className="w-16 h-16 mx-auto text-blue-400"
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

          <h3 className="text-2xl font-bold text-white mb-4">
            {isDragOver ? 'Drop your PNG here!' : 'Upload PNG Image'}
          </h3>
          
          <p className="text-gray-400 mb-6">
            Drag and drop your PNG file here, or click to browse
          </p>

          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <input
              type="file"
              accept="image/png"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg cursor-pointer transition-all duration-200 shadow-lg">
              {isProcessing ? 'Processing...' : 'Choose File'}
            </span>
          </motion.label>

          <div className="mt-6 text-sm text-gray-500">
            <p>• Supports PNG files only</p>
            <p>• Output: 1920x1080 JPG (~500KB)</p>
            <p>• Maintains aspect ratio with letterboxing</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FileUpload; 