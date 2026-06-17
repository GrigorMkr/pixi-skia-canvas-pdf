import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import type { Container, DisplayObject } from 'pixi.js-legacy';
import { Graphics } from 'pixi.js-legacy';
import {
  COLOR_RANDOM_MAX,
  DEFAULT_OBJECT_NAME,
  DOM_IDS,
  EVENT_SOURCES,
  INITIAL_SCENE_INDEX,
  PIXI_INTERACTIVE_MODE,
  POINTER_EVENTS,
  RANDOM_SHAPE_ANGLE_OFFSET,
  RANDOM_SHAPE_ANGLE_RANGE,
  RANDOM_SHAPE_FILL_ALPHA,
  RANDOM_SHAPE_LINE_HEIGHT_RANGE,
  RANDOM_SHAPE_LINE_LENGTH_BASE,
  RANDOM_SHAPE_LINE_LENGTH_RANGE,
  RANDOM_SHAPE_LINE_WIDTH_BASE,
  RANDOM_SHAPE_LINE_WIDTH_RANGE,
  RANDOM_SHAPE_MARGIN,
  RANDOM_SHAPE_RECT_BASE_HEIGHT,
  RANDOM_SHAPE_RECT_BASE_WIDTH,
  RANDOM_SHAPE_RECT_HEIGHT_RANGE,
  RANDOM_SHAPE_RECT_THRESHOLD,
  RANDOM_SHAPE_RECT_WIDTH_RANGE,
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './constants';
import { PointerBridge, attachSkiaPointerEvents } from './events/pointer-bridge';
import { PixiApp } from './pixi/pixi-app';
import { SCENE_BUILDERS } from './pixi/scenes';
import { initCanvasKit } from './skia/canvas-kit-loader';
import { downloadPdf, exportSceneToPdf } from './skia/pdf-export';
import { SkiaRenderer } from './skia/skia-renderer';

class App {
  private canvasKit!: CanvasKit;
  private pixiApp!: PixiApp;
  private skiaRenderer!: SkiaRenderer;
  private pointerBridge = new PointerBridge();
  private currentSceneIndex = INITIAL_SCENE_INDEX;
  private sceneRoot!: Container;

  private readonly pixiContainer: HTMLElement;
  private readonly skiaCanvas: HTMLCanvasElement;
  private readonly eventLog: HTMLElement;
  private readonly sceneLabel: HTMLElement;

  constructor() {
    this.pixiContainer = document.getElementById(DOM_IDS.pixiContainer)!;
    this.skiaCanvas = document.getElementById(DOM_IDS.skiaCanvas) as HTMLCanvasElement;
    this.eventLog = document.getElementById(DOM_IDS.eventLog)!;
    this.sceneLabel = document.getElementById(DOM_IDS.sceneLabel)!;
  }

  async init(): Promise<void> {
    this.canvasKit = await initCanvasKit();
    this.pixiApp = new PixiApp(this.pixiContainer);
    this.skiaRenderer = new SkiaRenderer(this.canvasKit, this.skiaCanvas, {
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
    });

    await this.loadScene(INITIAL_SCENE_INDEX);

    attachSkiaPointerEvents(
      this.skiaCanvas,
      () => this.sceneRoot,
      this.pointerBridge,
      (type, label) => this.logEvent(type, label, EVENT_SOURCES.skia),
    );

    this.bindControls();
  }

  private async loadScene(index: number): Promise<void> {
    this.currentSceneIndex = index;
    const builder = SCENE_BUILDERS[index];
    this.sceneLabel.textContent = `${index + 1} · ${builder.name}`;

    this.sceneRoot = await builder.build();
    this.pixiApp.setScene(this.sceneRoot);
    this.pointerBridge.scanInteractive(this.sceneRoot);
    this.wirePixiPointerLogging(this.sceneRoot);
    this.renderSkia();
  }

  private renderSkia(): void {
    this.skiaRenderer.render(this.sceneRoot);
  }

  private bindControls(): void {
    document
      .getElementById(DOM_IDS.btnRandom)!
      .addEventListener('click', () => this.handleRandomClick());

    document
      .getElementById(DOM_IDS.btnPrev)!
      .addEventListener('click', () => this.handlePrevClick());

    document
      .getElementById(DOM_IDS.btnNext)!
      .addEventListener('click', () => this.handleNextClick());

    document
      .getElementById(DOM_IDS.btnExportPdf)!
      .addEventListener('click', () => this.handleExportPdfClick());
  }

  private handleRandomClick(): void {
    this.addRandomShape();
  }

  private handlePrevClick(): void {
    const previous =
      (this.currentSceneIndex - 1 + SCENE_BUILDERS.length) % SCENE_BUILDERS.length;
    this.loadScene(previous);
  }

  private handleNextClick(): void {
    const next = (this.currentSceneIndex + 1) % SCENE_BUILDERS.length;
    this.loadScene(next);
  }

  private handleExportPdfClick(): void {
    this.exportPdf();
  }

  private wirePixiPointerLogging(root: Container): void {
    const walk = (node: DisplayObject): void => {
      if (this.isInteractive(node)) {
        const name = node.name || DEFAULT_OBJECT_NAME;
        node.on(POINTER_EVENTS.down, () =>
          this.logEvent(POINTER_EVENTS.down, name, EVENT_SOURCES.pixi),
        );
        node.on(POINTER_EVENTS.up, () =>
          this.logEvent(POINTER_EVENTS.up, name, EVENT_SOURCES.pixi),
        );
      }

      const children = (node as Container).children;

      if (children) {
        for (const child of children) {
          walk(child);
        }
      }
    };

    walk(root);
  }

  private addRandomShape(): void {
    const graphics = new Graphics();
    const name = `random-${Date.now()}`;
    graphics.name = name;
    graphics.eventMode = PIXI_INTERACTIVE_MODE.static;

    const color = Math.floor(Math.random() * COLOR_RANDOM_MAX);
    const x = Math.random() * (SCENE_WIDTH - RANDOM_SHAPE_MARGIN);
    const y = Math.random() * (SCENE_HEIGHT - RANDOM_SHAPE_MARGIN);

    if (Math.random() > RANDOM_SHAPE_RECT_THRESHOLD) {
      graphics
        .beginFill(color, RANDOM_SHAPE_FILL_ALPHA)
        .drawRect(
          0,
          0,
          RANDOM_SHAPE_RECT_BASE_WIDTH + Math.random() * RANDOM_SHAPE_RECT_WIDTH_RANGE,
          RANDOM_SHAPE_RECT_BASE_HEIGHT + Math.random() * RANDOM_SHAPE_RECT_HEIGHT_RANGE,
        )
        .endFill();
    } else {
      graphics
        .lineStyle(
          RANDOM_SHAPE_LINE_WIDTH_BASE + Math.random() * RANDOM_SHAPE_LINE_WIDTH_RANGE,
          color,
          1,
        )
        .moveTo(0, 0)
        .lineTo(
          RANDOM_SHAPE_LINE_LENGTH_BASE + Math.random() * RANDOM_SHAPE_LINE_LENGTH_RANGE,
          Math.random() * RANDOM_SHAPE_LINE_HEIGHT_RANGE,
        );
    }

    graphics.position.set(x, y);
    graphics.angle = Math.random() * RANDOM_SHAPE_ANGLE_RANGE - RANDOM_SHAPE_ANGLE_OFFSET;
    graphics.on(POINTER_EVENTS.down, () =>
      this.logEvent(POINTER_EVENTS.down, name, EVENT_SOURCES.pixi),
    );
    graphics.on(POINTER_EVENTS.up, () =>
      this.logEvent(POINTER_EVENTS.up, name, EVENT_SOURCES.pixi),
    );

    this.sceneRoot.addChild(graphics);
    this.pointerBridge.register(graphics, name);
    this.renderSkia();
  }

  private exportPdf(): void {
    const sceneNumber = this.currentSceneIndex + 1;
    const bytes = exportSceneToPdf(this.canvasKit, this.sceneRoot, {
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      title: `PIXI Scene ${sceneNumber}`,
    });

    downloadPdf(bytes, `pixi-skia-scene-${sceneNumber}.pdf`);
    this.logEvent('export', 'PDF saved', EVENT_SOURCES.skia);
  }

  private logEvent(type: string, target: string, source: string): void {
    const message = `[${source}] ${type}: ${target}`;
    console.log(message);
    this.eventLog.textContent = message;
  }

  private isInteractive(node: DisplayObject): boolean {
    return (
      node.eventMode === PIXI_INTERACTIVE_MODE.static ||
      node.eventMode === PIXI_INTERACTIVE_MODE.dynamic
    );
  }
}

export { App };
