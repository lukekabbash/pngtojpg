import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { downloadImage, processImage } from '../utils/imageProcessor';
import { useTheme } from '../App';

const ImagePreview = ({ originalInfo, processedResult, onReset, onReprocess }) => {
  const [customFilename, setCustomFilename] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [customQuality, setCustomQuality] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isDarkMode } = useTheme();

  const qualityOptions = [
    { value: 'auto', label: 'Auto Compress', description: 'Smart compression based on file size' },
    { value: 'high', label: 'High Quality', description: '90% quality - minimal compression' },
    { value: 'medium', label: 'Medium Quality', description: '75% quality - balanced compression' },
    { value: 'low', label: 'Low Quality', description: '50% quality - maximum compression' },
    { value: 'custom', label: 'Custom', description: 'Choose your own quality level' }
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
      
      const newResult = await processImage(originalInfo.file, targetQuality);
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
        const newResult = await processImage(originalInfo.file, quality);
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
      const format = processedResult.format || 'JPEG';
      const extension = format === 'PNG' ? '.png' : '.jpg';
      
      if (customFilename.trim()) {
        // Use custom filename, ensure it has correct extension
        filename = customFilename.trim();
        const currentExt = format === 'PNG' ? '.png' : '.jpg';
        const wrongExt = format === 'PNG' ? '.jpg' : '.png';
        
        // Remove wrong extension if present
        if (filename.toLowerCase().endsWith(wrongExt)) {
          filename = filename.slice(0, -4);
        }
        
        // Add correct extension if not present
        if (!filename.toLowerCase().endsWith(currentExt)) {
          filename += currentExt;
        }
      } else {
        // Use default filename based on original
        const baseName = originalInfo.name.replace(/\.(png|jpg|jpeg)$/i, '');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            Original PNG
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
              <span className={isDarkMode ? 'text-white' : 'text-black'}>PNG</span>
            </div>
          </div>
        </motion.div>

        {/* Quality Selector */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
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
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Quality Settings
          </h3>

          <div className="space-y-4">
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

            {selectedQuality === 'custom' && (
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
          <h3 className={`text-xl font-bold mb-4 flex items-center font-times uppercase tracking-wide ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            <svg className="w-5 h-5 mr-2 text-red-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Converted {processedResult?.format || 'JPG'}
          </h3>
          
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
                    placeholder={originalInfo.name.replace(/\.(png|jpg|jpeg)$/i, '')}
                    className={`w-full border-2 px-3 py-2 transition-all duration-200 font-times font-semibold ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-red-800' 
                        : 'bg-white border-gray-400 text-black placeholder-gray-600 focus:border-red-800'
                    } focus:outline-none focus:ring-2 focus:ring-red-800/20`}
                  />
                  <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-times font-bold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {processedResult.format === 'PNG' ? '.png' : '.jpg'}
                  </span>
                </div>
                <p className={`text-xs mt-1 font-times font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Leave empty to use: {originalInfo.name.replace(/\.(png|jpg|jpeg)$/i, processedResult.format === 'PNG' ? '.png' : '.jpg')}
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
            Download {processedResult.format === 'PNG' ? 'PNG' : 'JPG'}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ImagePreview; 