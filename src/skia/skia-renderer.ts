import type { CanvasKit, Surface } from '@rollerbird/canvaskit-wasm-pdf';
import type { Container } from 'pixi.js-legacy';
import { CANVAS_BACKGROUND_RGB } from '../constants';
import { convertPixiContainerToSkia } from './pixi-to-skia';

type BackgroundColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

interface SkiaRendererOptions {
  width: number;
  height: number;
  backgroundColor?: BackgroundColor;
}

class SkiaRenderer {
  private surface: Surface | null = null;
  private readonly canvasElement: HTMLCanvasElement;

  constructor(
    private readonly canvasKit: CanvasKit,
    canvasElement: HTMLCanvasElement,
    private options: SkiaRendererOptions,
  ) {
    this.canvasElement = canvasElement;
    this.canvasElement.width = options.width;
    this.canvasElement.height = options.height;
  }

  resize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.disposeSurface();
  }

  render(container: Container): void {
    const surface = this.ensureSurface();
    const canvas = surface.getCanvas();
    const background = this.options.backgroundColor ?? CANVAS_BACKGROUND_RGB;

    canvas.clear(
      this.canvasKit.Color4f(background.r, background.g, background.b, background.a),
    );
    convertPixiContainerToSkia(container, canvas, this.canvasKit);
    surface.flush();
  }

  destroy(): void {
    this.disposeSurface();
  }

  private ensureSurface(): Surface {
    if (!this.surface) {
      this.surface = this.canvasKit.MakeSWCanvasSurface(this.canvasElement);

      if (!this.surface) {
        throw new Error('Failed to create Skia surface');
      }
    }

    return this.surface;
  }

  private disposeSurface(): void {
    if (this.surface) {
      this.surface.delete();
      this.surface = null;
    }
  }
}

export { SkiaRenderer };
export type { SkiaRendererOptions };
