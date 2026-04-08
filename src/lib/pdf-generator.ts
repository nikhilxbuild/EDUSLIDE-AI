'use client';

import { PDFDocument, PageSizes } from 'pdf-lib';
import type { Page, CustomizationOptions } from '@/lib/types';

async function isPageBlank(
  imageUrl: string,
  threshold = 0.995
): Promise<boolean> {
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const scale = 0.1; // Check a downscaled version for performance
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' });
    if (!ctx) return false;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let whitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
        whitePixels++;
      }
    }
    const totalPixels = canvas.width * canvas.height;
    return whitePixels / totalPixels > threshold;
  } catch (e) {
    console.error('Failed to check if page is blank', e);
    return false;
  }
}

/**
 * Enhanced PDF Generator that handles all modular filters.
 */
export async function generatePdf(
  pages: Page[],
  customization: CustomizationOptions,
  setProgress: (progress: number) => void
): Promise<Uint8Array> {
  let pagesToProcess = pages.filter((p) => p.selected);
  setProgress(5);

  // 1. Optional Blank Page Removal
  if (customization.removeBlankPages) {
    const nonBlankPages: Page[] = [];
    if (pagesToProcess.length > 0) {
      for (let i = 0; i < pagesToProcess.length; i++) {
        const page = pagesToProcess[i];
        if (!(await isPageBlank(page.sourceUrl))) {
          nonBlankPages.push(page);
        }
        setProgress(5 + Math.round(((i + 1) / pagesToProcess.length) * 15));
      }
      pagesToProcess = nonBlankPages;
    }
  }

  const totalPages = pagesToProcess.length;
  if (totalPages === 0) {
    throw new Error('No pages to process. All selected pages might be blank.');
  }

  // 2. Setup PDF Document
  const newPdfDoc = await PDFDocument.create();
  const { rows, cols, orientation, margin, cropBorders, colorMode } = customization;
  const pageSize: [number, number] =
    orientation === 'portrait' ? [PageSizes.A4[0], PageSizes.A4[1]] : [PageSizes.A4[1], PageSizes.A4[0]];
  const marginOptions = { default: 50, minimal: 25, none: 0 };
  const pageMargin = marginOptions[margin];

  const effectiveWidth = pageSize[0] - pageMargin * 2;
  const effectiveHeight = pageSize[1] - pageMargin * 2;
  const cellWidth = effectiveWidth / cols;
  const cellHeight = effectiveHeight / rows;
  const pagesPerSheet = rows * cols;
  const numSheets = Math.ceil(totalPages / pagesPerSheet);

  // 3. Process each sheet and cell
  for (let i = 0; i < numSheets; i++) {
    const newPage = newPdfDoc.addPage(pageSize);
    const startIndex = i * pagesPerSheet;
    const endIndex = Math.min(startIndex + pagesPerSheet, totalPages);

    for (let j = startIndex; j < endIndex; j++) {
      const localIndex = j - startIndex;
      const page = pagesToProcess[j];

      // Load source image
      const image = new Image();
      image.src = page.sourceUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (err) => reject(new Error(`Failed to load page ${j + 1}: ${err}`));
      });

      // Calculate canvas size for high-quality embedding
      const targetEmbedDPI = 300;
      const embedScaleFactor = targetEmbedDPI / 72;
      const targetCellPixelWidth = cellWidth * embedScaleFactor;
      const targetCellPixelHeight = cellHeight * embedScaleFactor;
      
      const sourceAspectRatio = image.width / image.height;
      const targetCellAspectRatio = targetCellPixelWidth / targetCellPixelHeight;
      
      let finalCanvasWidth, finalCanvasHeight;
      if (sourceAspectRatio > targetCellAspectRatio) {
          finalCanvasWidth = targetCellPixelWidth;
          finalCanvasHeight = targetCellPixelWidth / sourceAspectRatio;
      } else {
          finalCanvasHeight = targetCellPixelHeight;
          finalCanvasWidth = targetCellPixelHeight * sourceAspectRatio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalCanvasWidth;
      canvas.height = finalCanvasHeight;
      const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Handle Crop
      const cropAmount = cropBorders ? 0.03 : 0;
      const sourceX = image.width * cropAmount;
      const sourceY = image.height * cropAmount;
      const sourceWidth = image.width * (1 - cropAmount * 2);
      const sourceHeight = image.height * (1 - cropAmount * 2);

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

      // MODULAR PIXEL PROCESSING
      const hasColorFilter = colorMode.invert || colorMode.grayscale || colorMode.bw || colorMode.clearBackground;
      
      if (hasColorFilter) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let k = 0; k < data.length; k += 4) {
          const r = data[k];
          const g = data[k + 1];
          const b = data[k + 2];
          
          const originalLuma = 0.299 * r + 0.587 * g + 0.114 * b;

          // MODULAR STEP 1: CLEAR BACKGROUND (Preprocessing based on original luma)
          // If clearBackground is enabled, we determine if the pixel is "background"
          // In a normal PDF, background is light. In a dark PDF (likely for inversion), background is dark.
          let isBackground = false;
          if (colorMode.clearBackground) {
            if (colorMode.invert) {
              // Targeting dark backgrounds of dark-themed PDFs
              if (originalLuma < 50) isBackground = true;
            } else {
              // Targeting off-white backgrounds of light-themed PDFs/scans
              if (originalLuma > 230) isBackground = true;
            }
          }

          if (isBackground) {
            data[k] = 255;
            data[k + 1] = 255;
            data[k + 2] = 255;
          } else {
            // Proceed with color mutations
            let processedR = r, processedG = g, processedB = b;

            // MODULAR STEP 2: INVERT
            if (colorMode.invert) {
              processedR = 255 - r;
              processedG = 255 - g;
              processedB = 255 - b;
            }

            // MODULAR STEP 3: GRAYSCALE / B&W
            if (colorMode.grayscale || colorMode.bw) {
              const currentLuma = 0.299 * processedR + 0.587 * processedG + 0.114 * processedB;
              if (colorMode.bw) {
                const bwValue = currentLuma < 128 ? 0 : 255;
                processedR = processedG = processedB = bwValue;
              } else {
                processedR = processedG = processedB = currentLuma;
              }
            }

            data[k] = processedR;
            data[k + 1] = processedG;
            data[k + 2] = processedB;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Embed processed image into PDF
      const processedImageBytes = await fetch(canvas.toDataURL('image/jpeg', 0.92)).then((res) => res.arrayBuffer());
      const pdfImage = await newPdfDoc.embedJpg(processedImageBytes);

      const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
      const scale = Math.min(cellWidth / imgWidth, cellHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const rowIndex = Math.floor(localIndex / cols);
      const colIndex = localIndex % cols;
      const x = pageMargin + colIndex * cellWidth + (cellWidth - scaledWidth) / 2;
      const y = pageSize[1] - pageMargin - (rowIndex + 1) * cellHeight + (cellHeight - scaledHeight) / 2;

      newPage.drawImage(pdfImage, { x, y, width: scaledWidth, height: scaledHeight });

      // Update progress
      const progress = 20 + Math.round(((i * pagesPerSheet + (localIndex + 1)) / totalPages) * 80);
      setProgress(progress > 95 ? 95 : progress);
    }
  }

  return await newPdfDoc.save({ useObjectStreams: true });
}
