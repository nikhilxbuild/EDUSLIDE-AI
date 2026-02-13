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
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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

export async function generatePdf(
  pages: Page[],
  customization: CustomizationOptions,
  setProgress: (progress: number) => void
): Promise<Uint8Array> {
  // 1. Filter selected pages
  let pagesToProcess = pages.filter((p) => p.selected);
  setProgress(5);

  // 2. Remove blank pages if requested
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

  const newPdfDoc = await PDFDocument.create();
  const { rows, cols, orientation, margin, colorMode, cropBorders } =
    customization;

  const pageSize: [number, number] =
    orientation === 'portrait'
      ? [PageSizes.A4[0], PageSizes.A4[1]]
      : [PageSizes.A4[1], PageSizes.A4[0]];

  const marginOptions = { default: 50, minimal: 25, none: 0 };
  const pageMargin = marginOptions[margin];

  const effectiveWidth = pageSize[0] - pageMargin * 2;
  const effectiveHeight = pageSize[1] - pageMargin * 2;
  const cellWidth = effectiveWidth / cols;
  const cellHeight = effectiveHeight / rows;
  const pagesPerSheet = rows * cols;
  const numSheets = Math.ceil(totalPages / pagesPerSheet);

  for (let i = 0; i < numSheets; i++) {
    const newPage = newPdfDoc.addPage(pageSize);
    const startIndex = i * pagesPerSheet;
    const endIndex = Math.min(startIndex + pagesPerSheet, totalPages);

    for (let j = startIndex; j < endIndex; j++) {
      const localIndex = j - startIndex;
      const page = pagesToProcess[j];

      const image = new Image();
      image.src = page.sourceUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (err) => reject(new Error(`Failed to load page ${j+1}: ${err}`));
      });
      
      const cropAmount = cropBorders ? 0.03 : 0;
      const sourceX = image.width * cropAmount;
      const sourceY = image.height * cropAmount;
      const sourceWidth = image.width * (1 - cropAmount * 2);
      const sourceHeight = image.height * (1 - cropAmount * 2);

      // Determine optimal canvas size for embedding to reduce file size.
      // Aim for ~200 DPI in the final PDF cell.
      const targetEmbedDPI = 200;
      const embedScaleFactor = targetEmbedDPI / 72; // PDF points are 1/72 inch
      const targetCellPixelWidth = cellWidth * embedScaleFactor;
      const targetCellPixelHeight = cellHeight * embedScaleFactor;
      
      const sourceAspectRatio = sourceWidth / sourceHeight;
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
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw the (potentially cropped) high-res source image onto the smaller canvas.
      // This performs the downscaling.
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const anyFilterEnabled = colorMode.invert || colorMode.grayscale || colorMode.bw;

      if (anyFilterEnabled) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let k = 0; k < data.length; k += 4) {
          let r = data[k];
          let g = data[k + 1];
          let b = data[k + 2];

          // 1. Apply Soft Invert if enabled
          if (colorMode.invert) {
            // Soft Invert
            r = 255 - r * 0.75;
            g = 255 - g * 0.75;
            b = 255 - b * 0.75;

            // Desaturate 25%
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            const desaturation = 0.25;
            r = r * (1 - desaturation) + gray * desaturation;
            g = g * (1 - desaturation) + gray * desaturation;
            b = b * (1 - desaturation) + gray * desaturation;
            
            // Brightness +10%
            r = Math.min(255, r * 1.1);
            g = Math.min(255, g * 1.1);
            b = Math.min(255, b * 1.1);
          }

          // 2. Apply Grayscale if enabled
          if (colorMode.grayscale) {
            const avg = (r + g + b) / 3;
            r = avg;
            g = avg;
            b = avg;
          }

          // 3. Apply B&W if enabled
          if (colorMode.bw) {
            const avg = (r + g + b) / 3;
            const color = avg > 128 ? 255 : 0;
            r = color;
            g = color;
            b = color;
          }
          
          data[k] = r;
          data[k + 1] = g;
          data[k + 2] = b;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Use JPEG for smaller file size
      const processedImageBytes = await fetch(
        canvas.toDataURL('image/jpeg', 0.85)
      ).then((res) => res.arrayBuffer());

      const pdfImage = await newPdfDoc.embedJpg(processedImageBytes);

      const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
      const scale = Math.min(cellWidth / imgWidth, cellHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const rowIndex = Math.floor(localIndex / cols);
      const colIndex = localIndex % cols;
      const x =
        pageMargin + colIndex * cellWidth + (cellWidth - scaledWidth) / 2;
      const y =
        pageSize[1] -
        pageMargin -
        (rowIndex + 1) * cellHeight +
        (cellHeight - scaledHeight) / 2;

      newPage.drawImage(pdfImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      const progress =
        20 +
        Math.round(((i * pagesPerSheet + (localIndex + 1)) / totalPages) * 80);
      setProgress(progress > 95 ? 95 : progress);
    }
  }

  return await newPdfDoc.save();
}
