import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import CropSelector from './components/CropSelector';
import ImagePreview from './components/ImagePreview';
import { processImage, getImageInfo } from './utils/imageProcessor';
import './index.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalInfo, setOriginalInfo] = useState(null);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [cropParams, setCropParams] = useState(null);
  const [processedResult, setProcessedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    try {
      setError(null);
      setSelectedFile(file);

      // Get original image info
      const info = await getImageInfo(file);
      setOriginalInfo({ ...info, file });

      // Check if image needs cropping (not already 16:9)
      const aspectRatio = info.width / info.height;
      const target169 = 16 / 9;
      const tolerance = 0.01; // Small tolerance for floating point comparison

      if (Math.abs(aspectRatio - target169) > tolerance) {
        // Image needs cropping, show crop selector
        setShowCropSelector(true);
      } else {
        // Image is already 16:9, process directly
        await processImageWithCrop(file, info, null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error processing image:', err);
    }
  };

  const handleCropSelect = async (cropParameters) => {
    setCropParams(cropParameters);
    setShowCropSelector(false);
    await processImageWithCrop(selectedFile, originalInfo, cropParameters);
  };

  const handleSkipCrop = async () => {
    setShowCropSelector(false);
    await processImageWithCrop(selectedFile, originalInfo, null);
  };

  const processImageWithCrop = async (file, info, cropParameters) => {
    try {
      setIsProcessing(true);
      
      // Process the image with crop parameters
      const result = await processImage(file, 500, cropParameters);
      setProcessedResult(result);
    } catch (err) {
      setError(err.message);
      console.error('Error processing image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalInfo(null);
    setShowCropSelector(false);
    setCropParams(null);
    setProcessedResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const getCurrentStep = () => {
    if (!selectedFile) return 'upload';
    if (showCropSelector) return 'crop';
    return 'preview';
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <Header />

          <main className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8 max-w-2xl mx-auto"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {getCurrentStep() === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileUpload 
                    onFileSelect={handleFileSelect} 
                    isProcessing={isProcessing}
                  />
                </motion.div>
              )}

              {getCurrentStep() === 'crop' && (
                <motion.div
                  key="crop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CropSelector
                    originalInfo={originalInfo}
                    onCropSelect={handleCropSelect}
                    onSkip={handleSkipCrop}
                  />
                </motion.div>
              )}

              {getCurrentStep() === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImagePreview
                    originalInfo={originalInfo}
                    processedResult={processedResult}
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Features Section - only show on upload step */}
          {getCurrentStep() === 'upload' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-20 max-w-4xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-center text-white mb-12">
                Why Choose Our Converter?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-dark-800 p-6 rounded-xl border border-dark-700 text-center"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
                  <p className="text-gray-400">Process images instantly with our optimized algorithms</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-dark-800 p-6 rounded-xl border border-dark-700 text-center"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Smart Cropping</h4>
                  <p className="text-gray-400">Choose exactly which part of your image to keep</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-dark-800 p-6 rounded-xl border border-dark-700 text-center"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">100% Private</h4>
                  <p className="text-gray-400">All processing happens locally in your browser</p>
                </motion.div>
              </div>
            </motion.section>
          )}

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-20 text-center text-gray-500 pb-8"
          >
            <p>© 2025 <a href="https://lukekabbash.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">Luke Kabbash</a></p>
          </motion.footer>
        </div>
      </div>
    </div>
  );
}

export default App; 