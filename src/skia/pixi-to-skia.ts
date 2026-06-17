import type {
  Canvas,
  CanvasKit,
  Path,
  Image as SkImage,
} from '@rollerbird/canvaskit-wasm-pdf';
import { Graphics, Sprite } from 'pixi.js-legacy';
import type { Container, DisplayObject, Matrix } from 'pixi.js-legacy';
import {
  MIN_POLYGON_POINT_COUNT,
  PIXI_SHAPES,
  SPRITE_DRAW_LEGACY_COMPAT,
} from '../constants';
import {
  applyPixiMatrix,
  createFillPaint,
  createStrokePaint,
} from './color-utils';

interface PixiStyle {
  visible: boolean;
  color: number;
  alpha: number;
}

interface PixiLineStyle extends PixiStyle {
  width: number;
}

interface GraphicsShape {
  type: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  closeStroke?: boolean;
}

interface GraphicsDataItem {
  shape: GraphicsShape;
  fillStyle: PixiStyle;
  lineStyle: PixiLineStyle;
  matrix: Matrix | null;
  holes: GraphicsDataItem[];
}

const spriteImageCache = new WeakMap<Sprite, SkImage>();

function convertPixiContainerToSkia(
  container: Container,
  canvas: Canvas,
  canvasKit: CanvasKit,
): void {
  container.updateTransform();
  renderDisplayObjectTree(container, canvas, canvasKit);
}

function renderDisplayObjectTree(
  node: DisplayObject,
  canvas: Canvas,
  canvasKit: CanvasKit,
): void {
  if (!node.visible || node.worldAlpha <= 0) {
    return;
  }

  canvas.save();
  applyPixiMatrix(canvas, node.transform.localTransform);

  if (node instanceof Graphics) {
    renderGraphics(node, canvas, canvasKit);
  } else if (node instanceof Sprite) {
    renderSprite(node, canvas, canvasKit);
  }

  const children = (node as Container).children;

  if (children) {
    for (const child of children) {
      renderDisplayObjectTree(child, canvas, canvasKit);
    }
  }

  canvas.restore();
}

function renderGraphics(
  graphics: Graphics,
  canvas: Canvas,
  canvasKit: CanvasKit,
): void {
  const items = graphics.geometry.graphicsData as GraphicsDataItem[];
  const worldAlpha = graphics.worldAlpha;

  for (const item of items) {
    canvas.save();

    if (item.matrix) {
      applyPixiMatrix(canvas, item.matrix);
    }

    const path = buildPathFromShape(item.shape, canvasKit);

    if (!path) {
      canvas.restore();
      continue;
    }

    if (item.fillStyle?.visible) {
      const fillPaint = createFillPaint(
        canvasKit,
        item.fillStyle.color,
        item.fillStyle.alpha,
        worldAlpha,
      );
      canvas.drawPath(path, fillPaint);
      fillPaint.delete();
    }

    if (item.lineStyle?.visible && item.lineStyle.width > 0) {
      const strokePaint = createStrokePaint(
        canvasKit,
        item.lineStyle.color,
        item.lineStyle.alpha,
        item.lineStyle.width,
        worldAlpha,
      );
      canvas.drawPath(path, strokePaint);
      strokePaint.delete();
    }

    path.delete();
    canvas.restore();
  }
}

function buildPathFromShape(shape: GraphicsShape, canvasKit: CanvasKit): Path | null {
  const path = new canvasKit.Path();
  const originX = shape.x ?? 0;
  const originY = shape.y ?? 0;
  const shapeWidth = shape.width ?? 0;
  const shapeHeight = shape.height ?? 0;
  const cornerRadius = shape.radius ?? 0;

  switch (shape.type) {
    case PIXI_SHAPES.RECT:
      path.addRect(canvasKit.XYWHRect(originX, originY, shapeWidth, shapeHeight));
      break;

    case PIXI_SHAPES.CIRC:
      path.addCircle(originX, originY, cornerRadius);
      break;

    case PIXI_SHAPES.ELIP:
      path.addOval(
        canvasKit.LTRBRect(
          originX - shapeWidth,
          originY - shapeHeight,
          originX + shapeWidth,
          originY + shapeHeight,
        ),
      );
      break;

    case PIXI_SHAPES.RREC:
      path.addRRect(
        canvasKit.RRectXY(
          canvasKit.XYWHRect(originX, originY, shapeWidth, shapeHeight),
          cornerRadius,
          cornerRadius,
        ),
      );
      break;

    case PIXI_SHAPES.POLY: {
      const points = shape.points ?? [];

      if (points.length < MIN_POLYGON_POINT_COUNT) {
        path.delete();
        return null;
      }

      path.addPoly(points, shape.closeStroke ?? true);
      break;
    }

    default:
      path.delete();
      return null;
  }

  return path;
}

function renderSprite(sprite: Sprite, canvas: Canvas, canvasKit: CanvasKit): void {
  const texture = sprite.texture;

  if (!texture?.valid) {
    return;
  }

  const image = getOrCreateSkImage(sprite, canvasKit);

  if (!image) {
    return;
  }

  const paint = new canvasKit.Paint();
  paint.setAntiAlias(true);
  paint.setAlphaf(sprite.worldAlpha);

  const sourceRect = canvasKit.XYWHRect(0, 0, texture.frame.width, texture.frame.height);
  const destRect = canvasKit.XYWHRect(0, 0, sprite.width, sprite.height);

  canvas.drawImageRect(
    image,
    sourceRect,
    destRect,
    paint,
    SPRITE_DRAW_LEGACY_COMPAT,
  );

  paint.delete();
}

function getOrCreateSkImage(sprite: Sprite, canvasKit: CanvasKit): SkImage | null {
  const cached = spriteImageCache.get(sprite);

  if (cached) {
    return cached;
  }

  const texture = sprite.texture;
  const resource = texture.baseTexture.resource as {
    source?: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;
  };
  const source = resource?.source;

  if (!source) {
    return null;
  }

  try {
    const frame = texture.frame;
    const extractCanvas = document.createElement('canvas');
    extractCanvas.width = frame.width;
    extractCanvas.height = frame.height;

    const ctx = extractCanvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      source as CanvasImageSource,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      0,
      0,
      frame.width,
      frame.height,
    );

    const image = canvasKit.MakeImageFromCanvasImageSource(extractCanvas);

    if (image) {
      spriteImageCache.set(sprite, image);
    }

    return image;
  } catch {
    return null;
  }
}

export { convertPixiContainerToSkia };
