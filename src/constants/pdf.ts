export const PDF_RASTER_DPI = 72;
export const PDF_MIME_TYPE = 'application/pdf';
export const PDF_DEFAULT_FILENAME = 'scene.pdf';

export const PDF_METADATA_DEFAULTS = {
  title: 'PIXI Skia Export',
  author: 'pixi-skia-pdf',
  subject: 'Vector PDF export',
  keywords: 'pixi,skia,pdf',
  creator: 'pixi-skia-pdf',
  producer: 'Skia PDF backend',
  language: 'ru-RU',
} as const;

export const PDF_ROOT_TAG = {
  type: 'Document',
  id: 1,
};
