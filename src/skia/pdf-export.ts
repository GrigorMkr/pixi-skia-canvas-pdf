import type { Canvas, CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import type { Container } from 'pixi.js-legacy';
import {
  CANVAS_BACKGROUND_RGB,
  PDF_DEFAULT_FILENAME,
  PDF_METADATA_DEFAULTS,
  PDF_MIME_TYPE,
  PDF_RASTER_DPI,
  PDF_ROOT_TAG,
} from '../constants';
import { convertPixiContainerToSkia } from './pixi-to-skia';

interface PdfExportOptions {
  width: number;
  height: number;
  title?: string;
  author?: string;
}

function buildPdfMetadata(options: PdfExportOptions) {
  return {
    title: options.title ?? PDF_METADATA_DEFAULTS.title,
    author: options.author ?? PDF_METADATA_DEFAULTS.author,
    subject: PDF_METADATA_DEFAULTS.subject,
    keywords: PDF_METADATA_DEFAULTS.keywords,
    creator: PDF_METADATA_DEFAULTS.creator,
    producer: PDF_METADATA_DEFAULTS.producer,
    language: PDF_METADATA_DEFAULTS.language,
    rasterDPI: PDF_RASTER_DPI,
    rootTag: {
      type: PDF_ROOT_TAG.type,
      id: PDF_ROOT_TAG.id,
      children: [],
    },
  };
}

function clearCanvasBackground(canvasKit: CanvasKit, canvas: Canvas): void {
  const { r, g, b, a } = CANVAS_BACKGROUND_RGB;
  canvas.clear(canvasKit.Color4f(r, g, b, a));
}

function exportSceneToPdf(
  canvasKit: CanvasKit,
  container: Container,
  options: PdfExportOptions,
): Uint8Array {
  container.updateTransform();

  const pdfDoc = canvasKit.MakePDFDocument(buildPdfMetadata(options));
  const pageCanvas = pdfDoc.beginPage(options.width, options.height);

  clearCanvasBackground(canvasKit, pageCanvas);
  convertPixiContainerToSkia(container, pageCanvas, canvasKit);

  pdfDoc.endPage();
  const pdfBytes = pdfDoc.close();
  pdfDoc.delete();

  return pdfBytes;
}

function downloadPdf(bytes: Uint8Array, filename = PDF_DEFAULT_FILENAME): void {
  const blob = new Blob([bytes.slice()], { type: PDF_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export { exportSceneToPdf, downloadPdf };
export type { PdfExportOptions };
