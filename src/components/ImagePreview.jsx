import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { downloadImage } from '../utils/imageProcessor';

const ImagePreview = ({ originalInfo, processedResult, onReset }) => {
  const [customFilename, setCustomFilename] = useState('');

  const handleDownload = () => {
    if (processedResult && processedResult.blob) {
      let filename;
      if (customFilename.trim()) {
        // Use custom filename, ensure it has .jpg extension
        filename = customFilename.trim();
        if (!filename.toLowerCase().endsWith('.jpg')) {
          filename += '.jpg';
        }
      } else {
        // Use default filename based on original
        filename = originalInfo.name.replace(/\.png$/i, '.jpg');
      }
      downloadImage(processedResult.blob, filename);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Original PNG
          </h3>
          
          <div className="aspect-video bg-dark-900 rounded-lg mb-4 overflow-hidden">
            <img
              src={URL.createObjectURL(originalInfo.file)}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Dimensions:</span>
              <span className="text-white">{originalInfo.width} × {originalInfo.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">File Size:</span>
              <span className="text-white">{formatFileSize(originalInfo.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Format:</span>
              <span className="text-white">PNG</span>
            </div>
          </div>
        </motion.div>

        {/* Processed Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Converted JPG
          </h3>
          
          {processedResult ? (
            <>
              <div className="aspect-video bg-dark-900 rounded-lg mb-4 overflow-hidden">
                <img
                  src={processedResult.url}
                  alt="Converted"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Dimensions:</span>
                  <span className="text-white">{processedResult.dimensions.width} × {processedResult.dimensions.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">File Size:</span>
                  <span className="text-green-400">{formatFileSize(processedResult.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quality:</span>
                  <span className="text-white">{processedResult.quality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aspect Ratio:</span>
                  <span className="text-white">{processedResult.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white">JPG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Compression:</span>
                  <span className="text-green-400">
                    {Math.round((1 - processedResult.size / originalInfo.size) * 100)}% smaller
                  </span>
                </div>
              </div>

              {/* Custom Filename Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Custom filename (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={originalInfo.name.replace(/\.png$/i, '')}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    .jpg
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use: {originalInfo.name.replace(/\.png$/i, '.jpg')}
                </p>
              </div>
            </>
          ) : (
            <div className="aspect-video bg-dark-900 rounded-lg mb-4 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center gap-8 mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 border border-dark-600 w-40"
        >
          Convert Another
        </motion.button>
        
        {processedResult && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg w-40"
          >
            Download JPG
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ImagePreview; 