export interface ResizedImageResult {
  blob: Blob;
  extension: 'webp' | 'jpeg';
  mimeType: 'image/webp' | 'image/jpeg';
  width: number;
  height: number;
}

/**
 * Resizes an image file in the browser to a max long edge of 1600px
 * and encodes it as WebP (with JPEG fallback).
 */
export async function resizeImageForUpload(
  file: File | Blob,
  maxLongEdge = 1600
): Promise<ResizedImageResult> {
  return new Promise((resolve, reject) => {
    // If not running in a browser environment (e.g. Node tests), handle gracefully
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve({
        blob: file,
        extension: 'webp',
        mimeType: 'image/webp',
        width: maxLongEdge,
        height: maxLongEdge,
      });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxLongEdge || height > maxLongEdge) {
        if (width >= height) {
          height = Math.round((height * maxLongEdge) / width);
          width = maxLongEdge;
        } else {
          width = Math.round((width * maxLongEdge) / height);
          height = maxLongEdge;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context is unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt encoding as WebP first
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob && webpBlob.type === 'image/webp') {
            resolve({
              blob: webpBlob,
              extension: 'webp',
              mimeType: 'image/webp',
              width,
              height,
            });
          } else {
            // Fallback to JPEG if browser doesn't support WebP export
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  resolve({
                    blob: jpegBlob,
                    extension: 'jpeg',
                    mimeType: 'image/jpeg',
                    width,
                    height,
                  });
                } else {
                  reject(new Error('Failed to encode image to Blob'));
                }
              },
              'image/jpeg',
              0.88
            );
          }
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = objectUrl;
  });
}

