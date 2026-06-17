import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import CanvasKitModule from '@rollerbird/canvaskit-wasm-pdf/bin/canvaskit-pdf.js';
import wasmUrl from '@rollerbird/canvaskit-wasm-pdf/bin/canvaskit-pdf.wasm?url';

type CanvasKitInitFn = (options?: {
  locateFile?: (file: string) => string;
}) => Promise<CanvasKit>;

let canvasKitPromise: Promise<CanvasKit> | null = null;

function resolveCanvasKitInit(module: unknown): CanvasKitInitFn {
  if (typeof module === 'function') {
    return module as CanvasKitInitFn;
  }

  const record = module as { default?: unknown };

  if (typeof record.default === 'function') {
    return record.default as CanvasKitInitFn;
  }

  const nested = record.default as { default?: unknown } | undefined;

  if (nested && typeof nested.default === 'function') {
    return nested.default as CanvasKitInitFn;
  }

  throw new Error('CanvasKitInit is not a function');
}

function isWasmFile(filename: string): boolean {
  return filename.endsWith('.wasm');
}

async function loadCanvasKitPdf(): Promise<CanvasKit> {
  const init = resolveCanvasKitInit(CanvasKitModule);

  return init({
    locateFile: (file) => (isWasmFile(file) ? wasmUrl : file),
  });
}

async function initCanvasKit(): Promise<CanvasKit> {
  if (!canvasKitPromise) {
    canvasKitPromise = loadCanvasKitPdf();
  }

  return canvasKitPromise;
}

export { initCanvasKit };
export type { CanvasKit };
