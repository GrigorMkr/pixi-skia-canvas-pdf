import type { DisplayObject, Container, Point } from 'pixi.js-legacy';
import { Graphics, Sprite } from 'pixi.js-legacy';
import {
  DEFAULT_OBJECT_NAME,
  PIXI_INTERACTIVE_MODE,
  POINTER_EVENTS,
} from '../constants';

type PointerEventType = typeof POINTER_EVENTS.down | typeof POINTER_EVENTS.up;

interface HitTarget {
  object: DisplayObject;
  label: string;
}

class PointerBridge {
  private targets: HitTarget[] = [];

  register(object: DisplayObject, label: string): void {
    this.targets.push({ object, label });
  }

  clear(): void {
    this.targets = [];
  }

  scanInteractive(container: Container): void {
    this.clear();
    this.walk(container);
  }

  hitTest(globalX: number, globalY: number, root: Container): DisplayObject | null {
    root.updateTransform();
    return this.findHit(root, { x: globalX, y: globalY });
  }

  getLabel(object: DisplayObject): string {
    const target = this.targets.find((entry) => entry.object === object);
    return target?.label ?? object.name ?? DEFAULT_OBJECT_NAME;
  }

  private walk(node: DisplayObject): void {
    if (this.isInteractive(node)) {
      this.register(node, node.name || DEFAULT_OBJECT_NAME);
    }

    const children = (node as Container).children;

    if (children) {
      for (const child of children) {
        this.walk(child);
      }
    }
  }

  private findHit(
    node: DisplayObject,
    globalPoint: { x: number; y: number },
  ): DisplayObject | null {
    if (!node.visible || node.worldAlpha <= 0) {
      return null;
    }

    const children = (node as Container).children;

    if (children) {
      for (let index = children.length - 1; index >= 0; index -= 1) {
        const hit = this.findHit(children[index], globalPoint);

        if (hit) {
          return hit;
        }
      }
    }

    if (!this.isInteractive(node)) {
      return null;
    }

    const local = node.worldTransform.applyInverse(globalPoint as Point);

    if (node instanceof Graphics && node.geometry.containsPoint(local)) {
      return node;
    }

    if (node instanceof Sprite && this.isPointInsideSprite(local, node)) {
      return node;
    }

    return null;
  }

  private isInteractive(node: DisplayObject): boolean {
    return (
      node.eventMode === PIXI_INTERACTIVE_MODE.static ||
      node.eventMode === PIXI_INTERACTIVE_MODE.dynamic
    );
  }

  private isPointInsideSprite(
    point: { x: number; y: number },
    sprite: Sprite,
  ): boolean {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x <= sprite.width &&
      point.y <= sprite.height
    );
  }
}

function attachSkiaPointerEvents(
  canvas: HTMLCanvasElement,
  getRoot: () => Container,
  bridge: PointerBridge,
  onEvent: (type: PointerEventType, label: string) => void,
): void {
  const toCanvasCoords = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: PointerEvent) => {
    const { x, y } = toCanvasCoords(event);
    const hit = bridge.hitTest(x, y, getRoot());

    if (hit) {
      onEvent(POINTER_EVENTS.down, bridge.getLabel(hit));
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    const { x, y } = toCanvasCoords(event);
    const hit = bridge.hitTest(x, y, getRoot());

    if (hit) {
      onEvent(POINTER_EVENTS.up, bridge.getLabel(hit));
    }
  };

  canvas.addEventListener(POINTER_EVENTS.down, handlePointerDown);
  canvas.addEventListener(POINTER_EVENTS.up, handlePointerUp);
}

export { PointerBridge, attachSkiaPointerEvents };
export type { PointerEventType, HitTarget };
