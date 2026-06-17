/// <reference types="vite/client" />

declare module '@rollerbird/canvaskit-wasm-pdf/bin/canvaskit-pdf.wasm?url' {
  const url: string;
  export default url;
}

declare module '@rollerbird/canvaskit-wasm-pdf/bin/canvaskit-pdf.js' {
  import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
  type InitFn = (options?: { locateFile?: (file: string) => string }) => Promise<CanvasKit>;
  const init: InitFn;
  export default init;
}
