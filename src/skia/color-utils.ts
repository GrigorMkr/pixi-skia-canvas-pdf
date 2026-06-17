import type { Canvas, CanvasKit, Paint } from '@rollerbird/canvaskit-wasm-pdf';
import {
  COLOR_CHANNEL_MAX,
  COLOR_HEX_MASK,
  SKIA_MATRIX_IDENTITY_TAIL,
} from '../constants';

type PixiMatrix = {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
};

function pixiColorToSkia(canvasKit: CanvasKit, color: number, alpha: number): Float32Array {
  const red = ((color >> 16) & COLOR_HEX_MASK) / COLOR_CHANNEL_MAX;
  const green = ((color >> 8) & COLOR_HEX_MASK) / COLOR_CHANNEL_MAX;
  const blue = (color & COLOR_HEX_MASK) / COLOR_CHANNEL_MAX;

  return canvasKit.Color4f(red, green, blue, alpha);
}

function applyPixiMatrix(canvas: Canvas, matrix: PixiMatrix): void {
  const [matrix20, matrix21, matrix22] = SKIA_MATRIX_IDENTITY_TAIL;
  canvas.concat([
    matrix.a,
    matrix.c,
    matrix.tx,
    matrix.b,
    matrix.d,
    matrix.ty,
    matrix20,
    matrix21,
    matrix22,
  ]);
}

function createFillPaint(
  canvasKit: CanvasKit,
  color: number,
  alpha: number,
  worldAlpha: number,
): Paint {
  const paint = new canvasKit.Paint();
  paint.setStyle(canvasKit.PaintStyle.Fill);
  paint.setColor(pixiColorToSkia(canvasKit, color, alpha * worldAlpha));
  paint.setAntiAlias(true);
  return paint;
}

function createStrokePaint(
  canvasKit: CanvasKit,
  color: number,
  alpha: number,
  width: number,
  worldAlpha: number,
): Paint {
  const paint = new canvasKit.Paint();
  paint.setStyle(canvasKit.PaintStyle.Stroke);
  paint.setColor(pixiColorToSkia(canvasKit, color, alpha * worldAlpha));
  paint.setStrokeWidth(width);
  paint.setAntiAlias(true);
  return paint;
}

export { pixiColorToSkia, applyPixiMatrix, createFillPaint, createStrokePaint };
