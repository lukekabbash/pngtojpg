import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

// Throttle function for performance optimization
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

const CropSelector = ({ originalInfo, onCropSelect, onSkip }) => {
  const [cropPosition, setCropPosition] = useState({ x: 0.5, y: 0.5 }); // Center by default
  const [isDragging, setIsDragging] = useState(false);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const animationFrameRef = useRef(null);

  const aspectRatios = useMemo(() => ({
    '16:9': { ratio: 16/9, label: '16:9 (Landscape)', dimensions: '1920×1080' },
    '9:16': { ratio: 9/16, label: '9:16 (Portrait)', dimensions: '1080×1920' },
    '1:1': { ratio: 1, label: '1:1 (Square)', dimensions: '1080×1080' }
  }), []);

  // Memoize crop area calculation for better performance
  const cropArea = useMemo(() => {
    if (!originalInfo) return null;

    const { width: imgWidth, height: imgHeight } = originalInfo;
    const targetAspectRatio = aspectRatios[aspectRatio].ratio;
    const imgAspectRatio = imgWidth / imgHeight;

    let cropWidth, cropHeight;

    if (imgAspectRatio > targetAspectRatio) {
      // Image is wider than target ratio, crop horizontally
      cropHeight = imgHeight;
      cropWidth = cropHeight * targetAspectRatio;
    } else {
      // Image is taller than target ratio, crop vertically
      cropWidth = imgWidth;
      cropHeight = cropWidth / targetAspectRatio;
    }

    // Apply zoom - smaller crop area means more zoom
    cropWidth = cropWidth / zoomLevel;
    cropHeight = cropHeight / zoomLevel;

    // Ensure crop doesn't exceed image bounds
    cropWidth = Math.min(cropWidth, imgWidth);
    cropHeight = Math.min(cropHeight, imgHeight);

    return { cropWidth, cropHeight };
  }, [originalInfo, aspectRatio, zoomLevel, aspectRatios]);

  // Memoize crop position calculations
  const cropPositionData = useMemo(() => {
    if (!cropArea || !originalInfo) return null;

    const { width: imgWidth, height: imgHeight } = originalInfo;
    const { cropWidth, cropHeight } = cropArea;

    // Calculate crop overlay dimensions and position for preview
    const scaleX = previewDimensions.width / imgWidth;
    const scaleY = previewDimensions.height / imgHeight;

    const previewCropWidth = cropWidth * scaleX;
    const previewCropHeight = cropHeight * scaleY;

    // Calculate the bounds for crop position
    const maxCropX = (imgWidth - cropWidth) / imgWidth;
    const maxCropY = (imgHeight - cropHeight) / imgHeight;

    const boundedCropX = Math.max(0, Math.min(maxCropX, cropPosition.x - (cropWidth / imgWidth) / 2));
    const boundedCropY = Math.max(0, Math.min(maxCropY, cropPosition.y - (cropHeight / imgHeight) / 2));

    const previewCropX = boundedCropX * previewDimensions.width;
    const previewCropY = boundedCropY * previewDimensions.height;

    return {
      previewCropWidth,
      previewCropHeight,
      previewCropX,
      previewCropY,
      boundedCropX,
      boundedCropY,
      cropWidth,
      cropHeight
    };
  }, [cropArea, originalInfo, previewDimensions, cropPosition]);

  // Update preview dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && imageRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const maxWidth = Math.min(600, container.width - 40);
        const maxHeight = Math.min(500, container.height - 40);

        const { width: imgWidth, height: imgHeight } = originalInfo;
        const imgAspectRatio = imgWidth / imgHeight;

        let previewWidth, previewHeight;

        if (imgAspectRatio > maxWidth / maxHeight) {
          previewWidth = maxWidth;
          previewHeight = maxWidth / imgAspectRatio;
        } else {
          previewHeight = maxHeight;
          previewWidth = maxHeight * imgAspectRatio;
        }

        setPreviewDimensions({ width: previewWidth, height: previewHeight });
      }
    };

    updateDimensions();
    const throttledResize = throttle(updateDimensions, 100);
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [originalInfo]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  // Throttled mouse move handler for better performance
  const throttledMouseMove = useCallback(
    throttle((e) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      setCropPosition({ x, y });
    }, 16), // ~60fps
    []
  );

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      throttledMouseMove(e);
    });
  }, [isDragging, throttledMouseMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Throttled wheel handler for zoom
  const throttledWheel = useCallback(
    throttle((e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(1, Math.min(3, prev + delta)));
    }, 50), // Slower throttle for zoom
    []
  );

  const handleWheel = useCallback((e) => {
    throttledWheel(e);
  }, [throttledWheel]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleConfirmCrop = useCallback(() => {
    if (!cropPositionData) return;

    const outputDimensions = {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 }
    };

    onCropSelect({
      x: cropPositionData.boundedCropX,
      y: cropPositionData.boundedCropY,
      width: cropPositionData.cropWidth / originalInfo.width,
      height: cropPositionData.cropHeight / originalInfo.height,
      aspectRatio: aspectRatio,
      outputDimensions: outputDimensions[aspectRatio]
    });
  }, [cropPositionData, aspectRatio, originalInfo, onCropSelect]);

  const handleAspectRatioChange = useCallback((newRatio) => {
    setAspectRatio(newRatio);
    setZoomLevel(1); // Reset zoom when changing aspect ratio
  }, []);

  const handleZoomChange = useCallback((e) => {
    setZoomLevel(parseFloat(e.target.value));
  }, []);

  const handleZoomButton = useCallback((delta) => {
    setZoomLevel(prev => Math.max(1, Math.min(3, prev + delta)));
  }, []);

  const needsCropping = useMemo(() => {
    if (!originalInfo) return false;
    const currentRatio = originalInfo.width / originalInfo.height;
    const targetRatio = aspectRatios[aspectRatio].ratio;
    const tolerance = 0.01;
    return Math.abs(currentRatio - targetRatio) > tolerance;
  }, [originalInfo, aspectRatio, aspectRatios]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!needsCropping && zoomLevel === 1) {
    // Image already matches aspect ratio and no zoom, skip crop selection
    onSkip();
    return null;
  }

  if (!cropPositionData) return null;

  const {
    previewCropWidth,
    previewCropHeight,
    previewCropX,
    previewCropY
  } = cropPositionData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
      ref={containerRef}
    >
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">
          Choose Crop Area
        </h3>
        
        <p className="text-gray-400 text-center mb-6">
          Select aspect ratio and position the crop area over the most important part of your image.
        </p>

        {/* Aspect Ratio Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-dark-700 rounded-lg p-1 flex gap-1">
            {Object.entries(aspectRatios).map(([key, { label, dimensions }]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAspectRatioChange(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  aspectRatio === key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-dark-600'
                }`}
              >
                <div className="text-center">
                  <div>{label}</div>
                  <div className="text-xs opacity-75">{dimensions}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className="text-gray-400 text-sm">Zoom:</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleZoomButton(-0.2)}
            disabled={zoomLevel <= 1}
            className="w-8 h-8 rounded-full bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
          >
            −
          </motion.button>
          
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoomLevel}
              onChange={handleZoomChange}
              className="w-24 h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white text-sm min-w-[3rem]">{zoomLevel.toFixed(1)}×</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleZoomButton(0.2)}
            disabled={zoomLevel >= 3}
            className="w-8 h-8 rounded-full bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white"
          >
            +
          </motion.button>
        </div>

        <div className="flex justify-center mb-6">
          <div 
            className="relative inline-block cursor-crosshair select-none"
            style={{ 
              width: previewDimensions.width, 
              height: previewDimensions.height 
            }}
          >
            <img
              ref={imageRef}
              src={URL.createObjectURL(originalInfo.file)}
              alt="Crop preview"
              className="w-full h-full object-contain rounded-lg"
              draggable={false}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
              style={{ willChange: 'transform' }} // Optimize for animations
            />
            
            {/* Overlay for non-cropped areas */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top overlay */}
              <div 
                className="absolute top-0 left-0 right-0 bg-black bg-opacity-50"
                style={{ height: previewCropY }}
              />
              
              {/* Bottom overlay */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50"
                style={{ 
                  height: previewDimensions.height - previewCropY - previewCropHeight 
                }}
              />
              
              {/* Left overlay */}
              <div 
                className="absolute left-0 bg-black bg-opacity-50"
                style={{ 
                  top: previewCropY,
                  width: previewCropX,
                  height: previewCropHeight 
                }}
              />
              
              {/* Right overlay */}
              <div 
                className="absolute right-0 bg-black bg-opacity-50"
                style={{ 
                  top: previewCropY,
                  width: previewDimensions.width - previewCropX - previewCropWidth,
                  height: previewCropHeight 
                }}
              />
            </div>

            {/* Crop area border */}
            <div 
              className="absolute border-2 border-blue-400 pointer-events-none"
              style={{
                left: previewCropX,
                top: previewCropY,
                width: previewCropWidth,
                height: previewCropHeight,
                willChange: 'transform' // Optimize for animations
              }}
            >
              <div className="absolute inset-0 bg-blue-400 bg-opacity-10" />
              
              {/* Corner indicators */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full" />
            </div>

            {/* Center crosshair */}
            <div 
              className="absolute w-4 h-4 pointer-events-none"
              style={{
                left: cropPosition.x * previewDimensions.width - 8,
                top: cropPosition.y * previewDimensions.height - 8,
                willChange: 'transform' // Optimize for animations
              }}
            >
              <div className="w-full h-0.5 bg-blue-400 absolute top-1/2 transform -translate-y-1/2" />
              <div className="h-full w-0.5 bg-blue-400 absolute left-1/2 transform -translate-x-1/2" />
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mb-6">
          <p>💡 Click and drag to reposition • Scroll to zoom • The blue rectangle shows your final crop</p>
          <p>Output will be {aspectRatios[aspectRatio].dimensions} pixels</p>
        </div>

        <div className="flex justify-center gap-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            className="bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 border border-dark-600"
          >
            Use Center Crop
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirmCrop}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg"
          >
            Confirm Crop
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CropSelector; 