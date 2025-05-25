import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import CropSelector from './components/CropSelector';
import ImagePreview from './components/ImagePreview';
import { processImage, getImageInfo } from './utils/imageProcessor';
import './index.css';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

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

  const handleReprocess = (newResult) => {
    setProcessedResult(newResult);
  };

  const getCurrentStep = () => {
    if (!selectedFile) return 'upload';
    if (showCropSelector) return 'crop';
    return 'preview';
  };

  return (
    <ThemeProvider>
      <AppContent 
        selectedFile={selectedFile}
        originalInfo={originalInfo}
        showCropSelector={showCropSelector}
        processedResult={processedResult}
        isProcessing={isProcessing}
        error={error}
        handleFileSelect={handleFileSelect}
        handleCropSelect={handleCropSelect}
        handleSkipCrop={handleSkipCrop}
        handleReset={handleReset}
        handleReprocess={handleReprocess}
        getCurrentStep={getCurrentStep}
      />
    </ThemeProvider>
  );
}

const AppContent = ({ 
  selectedFile, originalInfo, showCropSelector, processedResult, 
  isProcessing, error, handleFileSelect, handleCropSelect, 
  handleSkipCrop, handleReset, handleReprocess, getCurrentStep 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen font-times transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 text-white' 
        : 'bg-gray-100 text-black'
    }`}>
      {/* News-style background pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 30px,
            ${isDarkMode ? '#1f2937' : '#e5e7eb'} 30px,
            ${isDarkMode ? '#1f2937' : '#e5e7eb'} 31px
          )`
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
                  className={`border-2 px-6 py-4 mb-8 max-w-2xl mx-auto ${
                    isDarkMode 
                      ? 'bg-red-950/30 text-red-200 border-red-800' 
                      : 'bg-red-100 text-red-900 border-red-700'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-times font-bold">{error}</span>
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
                    onReprocess={handleReprocess}
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
              <h3 className={`text-3xl font-bold text-center mb-12 font-times uppercase tracking-wider ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}>
                Why Choose Our Converter?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  className={`p-6 border-2 text-center transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-400'
                  }`}
                >
                  <div className="w-12 h-12 bg-red-800/30 border border-red-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className={`text-lg font-bold mb-2 font-times uppercase tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}>Lightning Fast</h4>
                  <p className={`font-times ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Process images instantly with our optimized algorithms</p>
                </motion.div>

                <motion.div
                  className={`p-6 border-2 text-center transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-400'
                  }`}
                >
                  <div className="w-12 h-12 bg-red-800/30 border border-red-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className={`text-lg font-bold mb-2 font-times uppercase tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}>Smart Cropping</h4>
                  <p className={`font-times ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Choose exactly which part of your image to keep</p>
                </motion.div>

                <motion.div
                  className={`p-6 border-2 text-center transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-400'
                  }`}
                >
                  <div className="w-12 h-12 bg-red-800/30 border border-red-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className={`text-lg font-bold mb-2 font-times uppercase tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}>100% Private</h4>
                  <p className={`font-times ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>All processing happens locally in your browser</p>
                </motion.div>
              </div>
            </motion.section>
          )}

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-20 text-center pb-8"
          >
            <div className={`border-t-2 pt-8 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-400'
            }`}>
              <p className={`font-times font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                © 2025 <a 
                  href="https://lukekabbash.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-red-800 hover:text-red-900 transition-colors duration-200 font-times"
                >
                  Luke Kabbash
                </a>
              </p>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  );
};

export default App; 