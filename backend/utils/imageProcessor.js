const Jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessor {
  constructor() {
    this.defaultOptions = {
      enhance: true,
      denoise: true,
      sharpen: true,
      contrast: true,
      brightness: false,
      scale: 2.0
    };
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imagePath, options = {}) {
    try {
      const config = { ...this.defaultOptions, ...options };
      const image = await Jimp.read(imagePath);
      
      let processedImage = image.clone();

      // Convert to grayscale
      processedImage = processedImage.greyscale();

      // Apply contrast enhancement
      if (config.contrast) {
        processedImage = processedImage.contrast(0.3);
      }

      // Apply brightness adjustment if needed
      if (config.brightness) {
        processedImage = this.adjustBrightness(processedImage);
      }

      // Normalize the image
      processedImage = processedImage.normalize();

      // Apply noise reduction
      if (config.denoise) {
        processedImage = await this.reduceNoise(processedImage);
      }

      // Apply sharpening
      if (config.sharpen) {
        processedImage = this.sharpenImage(processedImage);
      }

      // Scale up the image for better OCR
      if (config.scale && config.scale !== 1.0) {
        const newWidth = Math.round(image.bitmap.width * config.scale);
        const newHeight = Math.round(image.bitmap.height * config.scale);
        processedImage = processedImage.resize(newWidth, newHeight, Jimp.RESIZE_BICUBIC);
      }

      // Apply threshold to create binary image
      processedImage = this.applyThreshold(processedImage);

      // Save processed image
      const processedPath = this.getProcessedImagePath(imagePath);
      await processedImage.writeAsync(processedPath);

      return {
        originalPath: imagePath,
        processedPath: processedPath,
        originalSize: {
          width: image.bitmap.width,
          height: image.bitmap.height
        },
        processedSize: {
          width: processedImage.bitmap.width,
          height: processedImage.bitmap.height
        }
      };

    } catch (error) {
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  /**
   * Adjust brightness automatically based on image histogram
   */
  adjustBrightness(image) {
    let totalBrightness = 0;
    let pixelCount = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Calculate brightness using luminance formula
      const brightness = (0.299 * red + 0.587 * green + 0.114 * blue);
      totalBrightness += brightness;
      pixelCount++;
    });

    const averageBrightness = totalBrightness / pixelCount;
    
    // Adjust brightness if image is too dark or too bright
    if (averageBrightness < 100) {
      return image.brightness(0.2); // Brighten dark images
    } else if (averageBrightness > 180) {
      return image.brightness(-0.1); // Darken bright images
    }

    return image;
  }

  /**
   * Reduce noise using a simple averaging filter
   */
  async reduceNoise(image) {
    return new Promise((resolve) => {
      const clone = image.clone();
      const kernel = [
        [1, 1, 1],
        [1, 2, 1],
        [1, 1, 1]
      ];
      const kernelSum = 10;

      clone.scan(1, 1, clone.bitmap.width - 2, clone.bitmap.height - 2, function (x, y, idx) {
        let sumR = 0, sumG = 0, sumB = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIdx = ((y + ky) * this.bitmap.width + (x + kx)) << 2;
            const weight = kernel[ky + 1][kx + 1];
            
            sumR += this.bitmap.data[pixelIdx + 0] * weight;
            sumG += this.bitmap.data[pixelIdx + 1] * weight;
            sumB += this.bitmap.data[pixelIdx + 2] * weight;
          }
        }

        this.bitmap.data[idx + 0] = Math.round(sumR / kernelSum);
        this.bitmap.data[idx + 1] = Math.round(sumG / kernelSum);
        this.bitmap.data[idx + 2] = Math.round(sumB / kernelSum);
      });

      resolve(clone);
    });
  }

  /**
   * Apply sharpening filter
   */
  sharpenImage(image) {
    const kernel = [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0]
    ];

    return this.applyConvolution(image, kernel);
  }

  /**
   * Apply convolution filter
   */
  applyConvolution(image, kernel) {
    const clone = image.clone();
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    clone.scan(halfKernel, halfKernel, 
      clone.bitmap.width - kernelSize + 1, 
      clone.bitmap.height - kernelSize + 1, 
      function (x, y, idx) {
        let sumR = 0, sumG = 0, sumB = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelY = y + ky - halfKernel;
            const pixelX = x + kx - halfKernel;
            const pixelIdx = (pixelY * this.bitmap.width + pixelX) << 2;
            const weight = kernel[ky][kx];
            
            sumR += this.bitmap.data[pixelIdx + 0] * weight;
            sumG += this.bitmap.data[pixelIdx + 1] * weight;
            sumB += this.bitmap.data[pixelIdx + 2] * weight;
          }
        }

        this.bitmap.data[idx + 0] = Math.max(0, Math.min(255, sumR));
        this.bitmap.data[idx + 1] = Math.max(0, Math.min(255, sumG));
        this.bitmap.data[idx + 2] = Math.max(0, Math.min(255, sumB));
      }
    );

    return clone;
  }

  /**
   * Apply threshold to create binary image
   */
  applyThreshold(image, threshold = 128) {
    return image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const gray = this.bitmap.data[idx + 0]; // Image is already grayscale
      const binary = gray > threshold ? 255 : 0;
      
      this.bitmap.data[idx + 0] = binary; // R
      this.bitmap.data[idx + 1] = binary; // G
      this.bitmap.data[idx + 2] = binary; // B
      this.bitmap.data[idx + 3] = 255;    // A
    });
  }

  /**
   * Detect and correct skew in document images
   */
  async correctSkew(image) {
    // Simple skew detection using Hough transform approximation
    const angles = [];
    const step = 0.5; // Degree step
    const maxAngle = 15; // Maximum skew angle to check

    for (let angle = -maxAngle; angle <= maxAngle; angle += step) {
      const rotated = image.clone().rotate(angle, false);
      const score = this.calculateSkewScore(rotated);
      angles.push({ angle, score });
    }

    // Find angle with best score
    const bestAngle = angles.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    if (Math.abs(bestAngle.angle) > 1) {
      return image.rotate(bestAngle.angle, false);
    }

    return image;
  }

  /**
   * Calculate skew score for an image
   */
  calculateSkewScore(image) {
    let horizontalLines = 0;
    const threshold = 200;

    // Scan horizontal lines and count transitions
    for (let y = 0; y < image.bitmap.height; y += 10) {
      let transitions = 0;
      let lastPixel = 0;

      for (let x = 0; x < image.bitmap.width; x++) {
        const idx = (image.bitmap.width * y + x) << 2;
        const pixel = image.bitmap.data[idx];
        
        if (Math.abs(pixel - lastPixel) > threshold) {
          transitions++;
        }
        lastPixel = pixel;
      }

      if (transitions > 4) {
        horizontalLines++;
      }
    }

    return horizontalLines;
  }

  /**
   * Remove borders and margins from document
   */
  cropToContent(image, padding = 10) {
    let minX = image.bitmap.width;
    let minY = image.bitmap.height;
    let maxX = 0;
    let maxY = 0;

    // Find content boundaries
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const pixel = this.bitmap.data[idx];
      
      if (pixel < 200) { // Assuming dark pixels are content
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    });

    // Add padding
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(image.bitmap.width, maxX + padding);
    maxY = Math.min(image.bitmap.height, maxY + padding);

    const width = maxX - minX;
    const height = maxY - minY;

    if (width > 0 && height > 0) {
      return image.crop(minX, minY, width, height);
    }

    return image;
  }

  /**
   * Get processed image file path
   */
  getProcessedImagePath(originalPath) {
    const parsed = path.parse(originalPath);
    return path.join(parsed.dir, `${parsed.name}_processed${parsed.ext}`);
  }

  /**
   * Clean up processed images
   */
  async cleanup(processedPath) {
    try {
      await fs.unlink(processedPath);
    } catch (error) {
      console.error('Failed to cleanup processed image:', error.message);
    }
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      const stats = await fs.stat(imagePath);

      return {
        width: image.bitmap.width,
        height: image.bitmap.height,
        size: stats.size,
        colorType: image.bitmap.channels === 4 ? 'RGBA' : 'RGB',
        bitDepth: 8,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }

  /**
   * Convert image format
   */
  async convertFormat(inputPath, outputPath, format = 'png') {
    try {
      const image = await Jimp.read(inputPath);
      await image.writeAsync(outputPath);
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to convert image format: ${error.message}`);
    }
  }
}

module.exports = new ImageProcessor();
