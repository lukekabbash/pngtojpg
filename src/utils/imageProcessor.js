/**
 * Image processing utilities for PNG to JPEG conversion
 */

export const processImage = async (file, targetSizeKB = 500, cropParams = null) => {
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
      const imgAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;

      let sourceX, sourceY, sourceWidth, sourceHeight;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (cropParams) {
        // Use custom crop parameters
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
        if (imgAspectRatio > targetAspectRatio) {
          // Image is wider than target ratio
          drawHeight = targetHeight;
          drawWidth = drawHeight * imgAspectRatio;
          offsetX = (targetWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than target ratio
          drawWidth = targetWidth;
          drawHeight = drawWidth / imgAspectRatio;
          offsetX = 0;
          offsetY = (targetHeight - drawHeight) / 2;
        }

        // Use entire source image
        sourceX = 0;
        sourceY = 0;
        sourceWidth = img.width;
        sourceHeight = img.height;
      }

      // Fill background with black (in case of letterboxing)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw the image
      if (cropParams) {
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          offsetX, offsetY, drawWidth, drawHeight
        );
      } else {
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }

      // Convert to JPEG with compression
      const compressImage = (quality) => {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', quality);
        });
      };

      // Binary search for optimal quality to achieve target file size
      const findOptimalQuality = async () => {
        let minQuality = 0.1;
        let maxQuality = 0.95;
        let bestBlob = null;
        let bestQuality = 0.8;

        for (let i = 0; i < 10; i++) {
          const currentQuality = (minQuality + maxQuality) / 2;
          const blob = await compressImage(currentQuality);
          const sizeKB = blob.size / 1024;

          if (Math.abs(sizeKB - targetSizeKB) < 50 || maxQuality - minQuality < 0.01) {
            bestBlob = blob;
            bestQuality = currentQuality;
            break;
          }

          if (sizeKB > targetSizeKB) {
            maxQuality = currentQuality;
          } else {
            minQuality = currentQuality;
            bestBlob = blob;
            bestQuality = currentQuality;
          }
        }

        return { blob: bestBlob, quality: bestQuality };
      };

      findOptimalQuality().then(({ blob, quality }) => {
        const result = {
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          sizeKB: Math.round(blob.size / 1024),
          quality: Math.round(quality * 100),
          dimensions: {
            width: targetWidth,
            height: targetHeight
          },
          aspectRatio: cropParams?.aspectRatio || '16:9'
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

export const downloadImage = (blob, filename = 'converted-image.jpg') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 