import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadImage, processImage } from '../utils/imageProcessor';
import { useTheme } from '../App';

const ImagePreview = ({ originalInfo, processedResult, onReset, onReprocess, cropParams }) => {
  const [customFilename, setCustomFilename] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [selectedFormat, setSelectedFormat] = useState('JPEG');
  const [customQuality, setCustomQuality] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const { isDarkMode } = useTheme();

  // Initialize format based on input file type
  useEffect(() => {
    if (originalInfo && originalInfo.file) {
      if (originalInfo.file.type === 'image/webp') {
        setSelectedFormat('WEBP');
        setSelectedQuality('high'); // For WebP, default to high quality to preserve quality during cropping
      } else if (originalInfo.file.type === 'image/png') {
        setSelectedFormat('JPEG'); // Convert PNG to JPEG by default
      } else if (originalInfo.file.type === 'image/jpeg' || originalInfo.file.type === 'image/jpg') {
        setSelectedFormat('JPEG'); // Keep JPEG as JPEG
      }
    }
  }, [originalInfo]);

  const getOriginalFormatLabel = () => {
    if (!originalInfo || !originalInfo.file) return 'Original Image';
    
    switch (originalInfo.file.type) {
      case 'image/png':
        return 'Original PNG';
      case 'image/jpeg':
      case 'image/jpg':
        return 'Original JPEG';
      case 'image/webp':
        return 'Original WebP';
      default:
        return 'Original Image';
    }
  };

  const qualityOptions = [
    { value: 'auto', label: 'Auto Compress', description: 'Smart compression based on file size' },
    { value: 'high', label: 'High Quality', description: '90% quality - minimal compression' },
    { value: 'medium', label: 'Medium Quality', description: '75% quality - balanced compression' },
    { value: 'low', label: 'Low Quality', description: '50% quality - maximum compression' },
    { value: 'custom', label: 'Custom', description: 'Choose your own quality level' }
  ];

  const formatOptions = [
    { value: 'JPEG', label: 'JPEG', description: 'Best for photos, smaller file sizes, no transparency' },
    { value: 'PNG', label: 'PNG', description: 'Lossless quality, preserves transparency, larger files' },
    { value: 'WEBP', label: 'WEBP', description: 'Modern format, excellent compression, supports transparency' }
  ];

  const handleQualityChange = async (newQuality) => {
    if (newQuality === selectedQuality) return;
    
    setSelectedQuality(newQuality);
    setIsProcessing(true);
    
    try {
      let targetQuality = null;
      switch (newQuality) {
        case 'high':
          targetQuality = 90;
          break;
        case 'medium':
          targetQuality = 75;
          break;
        case 'low':
          targetQuality = 50;
          break;
        case 'custom':
          targetQuality = customQuality;
          break;
        default: // auto
          targetQuality = null;
      }
      
      const newResult = await processImage(originalInfo.file, targetQuality, cropParams, selectedFormat);
      onReprocess(newResult);
    } catch (error) {
      console.error('Error reprocessing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatChange = async (newFormat) => {
    if (newFormat === selectedFormat) return;
    
    setSelectedFormat(newFormat);
    setIsProcessing(true);
    
    try {
      let targetQuality = null;
      switch (selectedQuality) {
        case 'high':
          targetQuality = 90;
          break;
        case 'medium':
          targetQuality = 75;
          break;
        case 'low':
          targetQuality = 50;
          break;
        case 'custom':
          targetQuality = customQuality;
          break;
        default: // auto
          targetQuality = null;
      }
      
      const newResult = await processImage(originalInfo.file, targetQuality, cropParams, newFormat);
      onReprocess(newResult);
    } catch (error) {
      console.error('Error reprocessing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomQualityChange = async (quality) => {
    setCustomQuality(quality);
    if (selectedQuality === 'custom') {
      setIsProcessing(true);
      try {
        const newResult = await processImage(originalInfo.file, quality, cropParams, selectedFormat);
        onReprocess(newResult);
      } catch (error) {
        console.error('Error reprocessing image:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDownload = () => {
    if (processedResult && processedResult.blob) {
      let filename;
      const format = selectedFormat;
      let extension;
      switch (format.toUpperCase()) {
        case 'PNG':
          extension = '.png';
          break;
        case 'WEBP':
          extension = '.webp';
          break;
        default: // JPEG
          extension = '.jpg';
      }
      
      if (customFilename.trim()) {
        // Use custom filename, ensure it has correct extension
        filename = customFilename.trim();
        
        // Remove any existing image extensions
        filename = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
        
        // Add correct extension
        filename += extension;
      } else {
        // Use default filename based on original
        const baseName = originalInfo.name.replace(/\.(png|jpg|jpeg|webp)$/i, '');
        filename = baseName + extension;
      }
      downloadImage(processedResult.blob, filename, format);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getQualityLabel = () => {
    const option = qualityOptions.find(opt => opt.value === selectedQuality);
    return option ? option.label : 'Auto Compress';
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
          className={`p-6 border-2 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-400'
          }`}
        >
          <h3 className={`text-xl font-bold mb-4 flex items-center font-times uppercase tracking-wide ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            <svg className="w-5 h-5 mr-2 text-red-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {getOriginalFormatLabel()}
          </h3>
          
          <div className={`aspect-video mb-4 overflow-hidden border-2 ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <img
              src={URL.createObjectURL(originalInfo.file)}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-2 text-sm font-times font-semibold">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Dimensions:</span>
              <span className={isDarkMode ? 'text-white' : 'text-black'}>{originalInfo.width} × {originalInfo.height}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>File Size:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{formatFileSize(originalInfo.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Format:</span>
              <span className={isDarkMode ? 'text-white' : 'text-black'}>
                {originalInfo.file.type === 'image/png' ? 'PNG' : 
                 originalInfo.file.type === 'image/jpeg' || originalInfo.file.type === 'image/jpg' ? 'JPEG' :
                 originalInfo.file.type === 'image/webp' ? 'WebP' : 'Unknown'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Processed Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-6 border-2 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold flex items-center font-times uppercase tracking-wide ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              <svg className="w-5 h-5 mr-2 text-red-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Converted {processedResult?.format || 'JPG'}
            </h3>
            
            {/* Quality Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQualityModal(true)}
              className={`px-3 py-2 border-2 transition-all duration-200 font-times font-bold text-sm uppercase tracking-wide flex items-center ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                  : 'bg-white hover:bg-gray-100 text-black border-gray-400'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Format & Quality
            </motion.button>
          </div>
          
          {processedResult ? (
            <>
              <div className={`aspect-video mb-4 overflow-hidden border-2 ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <img
                  src={processedResult.url}
                  alt="Converted"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-2 text-sm mb-4 font-times font-semibold">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Dimensions:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>{processedResult.dimensions.width} × {processedResult.dimensions.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Original Size:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>{formatFileSize(originalInfo.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Compressed Size:</span>
                  <span className="text-red-800 font-black">{formatFileSize(processedResult.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Compression:</span>
                  <span className="text-red-800 font-black">
                    {processedResult.compressionRatio || Math.round((1 - processedResult.size / originalInfo.size) * 100)}% smaller
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Quality:</span>
                  <span className="text-red-800 font-black">{processedResult.quality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Aspect Ratio:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>{processedResult.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Format:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-black'}>{processedResult.format || 'JPEG'}</span>
                </div>
                {processedResult.preservedTransparency && (
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Transparency:</span>
                    <span className="text-red-800 font-black">Preserved</span>
                  </div>
                )}
              </div>

              {/* Custom Filename Input */}
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 font-times uppercase tracking-wide ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Custom filename (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={originalInfo.name.replace(/\.(png|jpg|jpeg|webp)$/i, '')}
                    className={`w-full border-2 px-3 py-2 transition-all duration-200 font-times font-semibold ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-red-800' 
                        : 'bg-white border-gray-400 text-black placeholder-gray-600 focus:border-red-800'
                    } focus:outline-none focus:ring-2 focus:ring-red-800/20`}
                  />
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-times font-bold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedFormat === 'PNG' ? '.png' : selectedFormat === 'WEBP' ? '.webp' : '.jpg'}
                  </span>
                </div>
                <p className={`text-xs mt-1 font-times font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Leave empty to use: {originalInfo.name.replace(/\.(png|jpg|jpeg|webp)$/i, selectedFormat === 'PNG' ? '.png' : selectedFormat === 'WEBP' ? '.webp' : '.jpg')}
                </p>
              </div>
            </>
          ) : (
            <div className={`aspect-video mb-4 flex items-center justify-center border-2 ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
            }`}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-red-800 border-t-transparent rounded-full"
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
          className={`font-bold py-4 px-8 transition-all duration-200 border-2 w-48 font-times uppercase tracking-wider ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' 
              : 'bg-white hover:bg-gray-100 text-black border-gray-400'
          }`}
        >
          Convert Another
        </motion.button>
        
        {processedResult && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="bg-red-800 hover:bg-red-900 text-white font-bold py-4 px-8 transition-all duration-200 shadow-lg w-48 font-times uppercase tracking-wider border-2 border-red-800 hover:border-red-900"
          >
            Download {selectedFormat}
          </motion.button>
        )}
      </motion.div>

      {/* Quality Settings Modal */}
      <AnimatePresence>
        {showQualityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQualityModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`max-w-md w-full border-2 p-6 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-400'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold font-times uppercase tracking-wide ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>
                  Format & Quality Settings
                </h3>
                <button
                  onClick={() => setShowQualityModal(false)}
                  className={`p-2 hover:bg-gray-100 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <h4 className={`text-lg font-bold mb-3 font-times uppercase tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}>
                    Output Format
                  </h4>
                  <div className="space-y-2">
                    {formatOptions.map((option) => (
                      <div key={option.value}>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="format"
                            value={option.value}
                            checked={selectedFormat === option.value}
                            onChange={() => handleFormatChange(option.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center transition-colors ${
                            selectedFormat === option.value
                              ? 'border-red-800 bg-red-800'
                              : isDarkMode 
                                ? 'border-gray-600' 
                                : 'border-gray-400'
                          }`}>
                            {selectedFormat === option.value && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className={`font-bold font-times ${isDarkMode ? 'text-white' : 'text-black'}`}>
                              {option.label}
                            </div>
                            <div className={`text-xs font-times ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {option.description}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Selection - only show for lossy formats */}
                {selectedFormat !== 'PNG' && (
                  <div>
                    <h4 className={`text-lg font-bold mb-3 font-times uppercase tracking-wide ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}>
                      Quality Settings
                    </h4>
                    <div className="space-y-2">
                      {qualityOptions.map((option) => (
                        <div key={option.value}>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="quality"
                              value={option.value}
                              checked={selectedQuality === option.value}
                              onChange={() => handleQualityChange(option.value)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center transition-colors ${
                              selectedQuality === option.value
                                ? 'border-red-800 bg-red-800'
                                : isDarkMode 
                                  ? 'border-gray-600' 
                                  : 'border-gray-400'
                            }`}>
                              {selectedQuality === option.value && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className={`font-bold font-times ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                {option.label}
                              </div>
                              <div className={`text-xs font-times ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {option.description}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuality === 'custom' && selectedFormat !== 'PNG' && (
                  <div className="mt-4 p-4 border-2 border-red-800 bg-red-800/10">
                    <label className={`block text-sm font-bold mb-2 font-times ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}>
                      Quality: {customQuality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={customQuality}
                      onChange={(e) => handleCustomQualityChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #991b1b 0%, #991b1b ${(customQuality - 10) / 80 * 100}%, #d1d5db ${(customQuality - 10) / 80 * 100}%, #d1d5db 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1 font-times font-semibold">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>10%</span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>90%</span>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-red-800 border-t-transparent rounded-full"
                    />
                    <span className={`ml-2 text-sm font-times font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Processing...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQualityModal(false)}
                  className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-6 transition-all duration-200 font-times uppercase tracking-wider border-2 border-red-800 hover:border-red-900"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImagePreview; 