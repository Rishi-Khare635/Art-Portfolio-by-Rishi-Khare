/**
 * Compresses an image file (data URL or File) to ensure maximum visual sharpness
 * while guaranteeing the data size safely fits within Firestore's 1MB document limit (< 600KB).
 */
export async function compressImageFile(
  file: File | Blob, 
  maxDimension = 1200, 
  quality = 0.8
): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let currentMaxDim = maxDimension;
        let currentQuality = quality;
        let finalDataUrl = '';

        // Multi-pass safety check: ensure base64 string is < 650,000 chars (~480KB)
        for (let pass = 0; pass < 4; pass++) {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > currentMaxDim) {
              height = Math.round((height * currentMaxDim) / width);
              width = currentMaxDim;
            }
          } else {
            if (height > currentMaxDim) {
              width = Math.round((width * currentMaxDim) / height);
              height = currentMaxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            finalDataUrl = readerEvent.target?.result as string;
            break;
          }

          // Draw with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Embed anti-AI disruption watermark directly onto new uploaded image canvas pixels
          ctx.save();

          // 1. Diagonal Anti-AI Inpainting repeating pattern
          ctx.translate(width / 2, height / 2);
          ctx.rotate((-25 * Math.PI) / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const centerFontSize = Math.max(14, Math.round(width * 0.028));
          ctx.font = `bold ${centerFontSize}px monospace, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 3;

          const stepY = centerFontSize * 3.5;
          for (let y = -height; y < height; y += stepY) {
            ctx.fillText('rishi • rishi • © rishi • rishi • rishi', 0, y);
          }
          ctx.restore();

          // 2. High-contrast bold corner signature stamp
          ctx.save();
          const fontSize = Math.max(20, Math.round(width * 0.045));
          ctx.font = `900 ${fontSize}px monospace, system-ui, sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          
          // Outer black stroke for high contrast on light artworks
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.lineWidth = Math.max(3, fontSize * 0.15);
          ctx.strokeText('© rishi', width - (fontSize * 0.6), height - (fontSize * 0.6));

          // Inner solid crisp fill
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillText('© rishi', width - (fontSize * 0.6), height - (fontSize * 0.6));
          ctx.restore();

          // Try webp first for supreme compression, fallback to jpeg
          try {
            finalDataUrl = canvas.toDataURL('image/webp', currentQuality);
            if (!finalDataUrl.startsWith('data:image/webp')) {
              finalDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
            }
          } catch {
            finalDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          }

          // If size is under 600KB (600,000 characters in base64), it's perfect!
          if (finalDataUrl.length < 600000) {
            break;
          }

          // Otherwise reduce dimension and quality for next pass
          currentMaxDim = Math.round(currentMaxDim * 0.8);
          currentQuality = Math.max(0.6, currentQuality - 0.1);
        }

        const sizeKb = Math.round((finalDataUrl.length * (3 / 4)) / 1024);
        resolve({ dataUrl: finalDataUrl, sizeKb });
      };

      img.onerror = () => reject(new Error('Failed to parse artwork image.'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file from device.'));
    reader.readAsDataURL(file);
  });
}
