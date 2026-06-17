import { Application } from 'pixi.js-legacy';
import type { Container } from 'pixi.js-legacy';
import {
  PIXI_APP_RESOLUTION,
  PIXI_STAGE_BACKGROUND,
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from '../constants';

class PixiApp {
  readonly app: Application;
  readonly stage: Container;

  constructor(container: HTMLElement) {
    this.app = new Application({
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      backgroundColor: PIXI_STAGE_BACKGROUND,
      forceCanvas: true,
      antialias: true,
      resolution: PIXI_APP_RESOLUTION,
    });

    container.appendChild(this.app.view as HTMLCanvasElement);
    this.stage = this.app.stage;
  }

  setScene(sceneRoot: Container): void {
    this.stage.removeChildren();
    this.stage.addChild(sceneRoot);
  }

  destroy(): void {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}

export { PixiApp };
