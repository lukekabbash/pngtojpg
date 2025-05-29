/**
 * Image processing utilities for PNG to JPEG conversion
 */

// Helper function to check if image has transparency
const hasTransparency = (canvas, ctx) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
};

export const processImage = async (file, targetQuality = null, cropParams = null, outputFormat = 'JPEG') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Set target dimensions based on crop parameters or default to 1920x1080
      let targetWidth = 1920;
      let targetHeight = 1080;
      
      if (cropParams && cropParams.outputDimensions) {
        targetWidth = cropParams.outputDimensions.width;
        targetHeight = cropParams.outputDimensions.height;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Calculate scaling and positioning
      let sourceX, sourceY, sourceWidth, sourceHeight;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (cropParams) {
        // Use custom crop parameters - these are already in pixel coordinates
        sourceX = cropParams.x * img.width;
        sourceY = cropParams.y * img.height;
        sourceWidth = cropParams.width * img.width;
        sourceHeight = cropParams.height * img.height;
        
        // Scale to fill the entire canvas
        drawWidth = targetWidth;
        drawHeight = targetHeight;
        offsetX = 0;
        offsetY = 0;
      } else {
        // Use the original center-crop logic for 16:9
        const imgAspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight;
        
        if (imgAspectRatio > targetAspectRatio) {
          // Image is wider than target ratio - crop from sides
          sourceHeight = img.height;
          sourceWidth = sourceHeight * targetAspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          // Image is taller than target ratio - crop from top/bottom
          sourceWidth = img.width;
          sourceHeight = sourceWidth / targetAspectRatio;
          sourceX = 0;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        drawWidth = targetWidth;
        drawHeight = targetHeight;
        offsetX = 0;
        offsetY = 0;
      }

      // Clear canvas with transparent background first
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // Draw the image with correct crop parameters
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        offsetX, offsetY, drawWidth, drawHeight
      );

      // Check if the image has transparency (only relevant for PNG/WEBP)
      const imageHasTransparency = hasTransparency(canvas, ctx);
      
      // Determine output format
      let mimeType, fileExtension, isLossless;
      switch (outputFormat.toUpperCase()) {
        case 'PNG':
          mimeType = 'image/png';
          fileExtension = '.png';
          isLossless = true;
          break;
        case 'WEBP':
          mimeType = 'image/webp';
          fileExtension = '.webp';
          isLossless = false;
          break;
        default: // JPEG
          mimeType = 'image/jpeg';
          fileExtension = '.jpg';
          isLossless = false;
          outputFormat = 'JPEG';
      }
      
      // If image has transparency and format doesn't support it, force PNG
      if (imageHasTransparency && !['PNG', 'WEBP'].includes(outputFormat.toUpperCase())) {
        mimeType = 'image/png';
        fileExtension = '.png';
        outputFormat = 'PNG';
        isLossless = true;
      }

      // For lossless formats, use directly
      if (isLossless || (outputFormat.toUpperCase() === 'PNG')) {
        canvas.toBlob((blob) => {
          const result = {
            blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            sizeKB: Math.round(blob.size / 1024),
            quality: 100, // Lossless
            dimensions: {
              width: targetWidth,
              height: targetHeight
            },
            aspectRatio: cropParams?.aspectRatio || '16:9',
            format: outputFormat,
            preservedTransparency: imageHasTransparency
          };
          resolve(result);
        }, mimeType);
        return;
      }

      // For lossy formats (JPEG/WEBP), handle compression
      let tempCanvas = canvas;
      let tempCtx = ctx;
      
      // For JPEG, fill background with white (WEBP supports transparency)
      if (outputFormat.toUpperCase() === 'JPEG') {
        tempCanvas = document.createElement('canvas');
        tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        
        // Fill with white background
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Draw the original image on top
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Convert with compression
      const compressImage = (quality) => {
        return new Promise((resolve) => {
          tempCanvas.toBlob((blob) => {
            resolve(blob);
          }, mimeType, quality / 100);
        });
      };

      // Get original file size for comparison
      const originalSizeKB = file.size / 1024;
      
      // If a specific quality is requested, use it directly
      if (targetQuality !== null) {
        compressImage(targetQuality).then((blob) => {
          const result = {
            blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            sizeKB: Math.round(blob.size / 1024),
            quality: targetQuality,
            dimensions: {
              width: targetWidth,
              height: targetHeight
            },
            aspectRatio: cropParams?.aspectRatio || '16:9',
            format: outputFormat,
            preservedTransparency: outputFormat.toUpperCase() === 'WEBP' ? imageHasTransparency : false,
            originalSizeKB: Math.round(originalSizeKB),
            compressionRatio: Math.round((1 - blob.size / file.size) * 100)
          };
          resolve(result);
        });
        return;
      }
      
      // Aggressive compression strategy - find the lowest quality that still looks decent
      const findOptimalCompression = async () => {
        // Start with different quality levels based on original file size
        let startQuality = 85; // Start high for quality
        let minQuality = 30;   // Don't go below 30% quality
        let maxQuality = 95;   // Cap at 95% to ensure some compression
        
        // For very large files, be more aggressive
        if (originalSizeKB > 2000) {
          startQuality = 70;
          minQuality = 20;
        } else if (originalSizeKB > 1000) {
          startQuality = 75;
          minQuality = 25;
        }

        let bestBlob = null;
        let bestQuality = startQuality;
        let bestCompressionRatio = 0;

        // Test multiple quality levels to find the sweet spot
        const qualityLevels = [
          maxQuality,     // 95% - minimal compression
          85,             // 85% - light compression
          75,             // 75% - moderate compression
          65,             // 65% - good compression
          55,             // 55% - aggressive compression
          45,             // 45% - very aggressive
          35,             // 35% - maximum reasonable compression
          minQuality      // minimum quality
        ];

        for (const quality of qualityLevels) {
          const blob = await compressImage(quality);
          const sizeKB = blob.size / 1024;
          const compressionRatio = (originalSizeKB - sizeKB) / originalSizeKB;
          
          // Always prefer more compression, but ensure we don't make files bigger
          if (sizeKB < originalSizeKB && compressionRatio > bestCompressionRatio) {
            bestBlob = blob;
            bestQuality = quality;
            bestCompressionRatio = compressionRatio;
          }
        }

        // If no compression worked (file got bigger), use highest quality
        if (!bestBlob) {
          bestBlob = await compressImage(maxQuality);
          bestQuality = maxQuality;
        }

        // For very small files that might get bigger, try even higher quality
        if (originalSizeKB < 100 && bestBlob.size > file.size) {
          const highQualityBlob = await compressImage(98);
          if (highQualityBlob.size <= file.size) {
            bestBlob = highQualityBlob;
            bestQuality = 98;
          }
        }

        return { blob: bestBlob, quality: bestQuality };
      };

      findOptimalCompression().then(({ blob, quality }) => {
        const result = {
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          sizeKB: Math.round(blob.size / 1024),
          quality: Math.round(quality),
          dimensions: {
            width: targetWidth,
            height: targetHeight
          },
          aspectRatio: cropParams?.aspectRatio || '16:9',
          format: outputFormat,
          preservedTransparency: false,
          originalSizeKB: Math.round(originalSizeKB),
          compressionRatio: Math.round((1 - blob.size / file.size) * 100)
        };
        resolve(result);
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const getImageInfo = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        sizeKB: Math.round(file.size / 1024),
        type: file.type,
        name: file.name
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const downloadImage = (blob, filename = 'converted-image', format = 'JPEG') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Use appropriate file extension based on format
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
  
  const finalFilename = filename.includes('.') ? filename : filename + extension;
  
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 