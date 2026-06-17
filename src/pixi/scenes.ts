import { Container, Graphics, Sprite, Texture } from 'pixi.js-legacy';
import {
  COLOR_RANDOM_MAX,
  DEMO_COLORS,
  DEMO_G1,
  DEMO_G2,
  DEMO_G3,
  DEMO_G4,
  DEMO_SUB_CONTAINER,
  PIXI_INTERACTIVE_MODE,
  RANDOM_SCENE,
  SAMPLE_TEXTURE,
  SAMPLE_TEXTURE_GRADIENT,
  SCENE_BACKGROUND,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  SPRITE_SCENE,
} from '../constants';

type SceneBuilder = {
  name: string;
  build: () => Container | Promise<Container>;
};

function makeInteractiveGraphics(name: string): Graphics {
  const graphics = new Graphics();
  graphics.name = name;
  graphics.eventMode = PIXI_INTERACTIVE_MODE.static;
  return graphics;
}

function createDemoScene(): Container {
  const mainContainer = new Container();
  const subContainer = new Container();

  const g1 = makeInteractiveGraphics('g1');
  g1.beginFill(DEMO_COLORS.red)
    .drawEllipse(0, 0, DEMO_G1.ellipseRadiusX, DEMO_G1.ellipseRadiusY)
    .endFill();
  g1.position.set(DEMO_G1.positionX, DEMO_G1.positionY);
  g1.angle = DEMO_G1.angle;
  g1.on('pointerdown', () => console.log('g1 pointerdown!'));

  const g2 = makeInteractiveGraphics('g2');
  g2.beginFill(DEMO_COLORS.blue)
    .drawRect(DEMO_G2.rectX, DEMO_G2.rectY, DEMO_G2.rectWidth, DEMO_G2.rectHeight)
    .endFill();
  g2.position.set(DEMO_G2.positionX, DEMO_G2.positionY);
  g2.angle = DEMO_G2.angle;
  g2.scale.set(DEMO_G2.scaleX, DEMO_G2.scaleY);
  g2.on('pointerup', () => console.log('g2 pointerup!'));

  const g3 = makeInteractiveGraphics('g3');
  g3.lineStyle(DEMO_G3.lineWidth, DEMO_COLORS.white, 1)
    .moveTo(0, 0)
    .lineTo(DEMO_G3.lineEndX, DEMO_G3.lineEndY);
  g3.angle = DEMO_G3.angle;

  const g4 = makeInteractiveGraphics('g4');
  g4.lineStyle(DEMO_G4.lineWidth, DEMO_COLORS.yellow, 1)
    .moveTo(0, DEMO_G4.moveY)
    .lineTo(DEMO_G4.lineEndX, DEMO_G4.lineEndY);
  g4.angle = DEMO_G4.angle;

  subContainer.position.set(DEMO_SUB_CONTAINER.positionX, DEMO_SUB_CONTAINER.positionY);
  subContainer.addChild(g3, g4);
  mainContainer.addChild(subContainer, g1, g2);

  return mainContainer;
}

async function createSpriteScene(): Promise<Container> {
  const container = new Container();

  const background = makeInteractiveGraphics('bg-rect');
  background
    .beginFill(DEMO_COLORS.slate)
    .drawRect(0, 0, SCENE_BACKGROUND.width, SCENE_BACKGROUND.height)
    .endFill();
  container.addChild(background);

  const circle = makeInteractiveGraphics('green-circle');
  circle.beginFill(DEMO_COLORS.green)
    .drawCircle(0, 0, SPRITE_SCENE.circleRadius)
    .endFill();
  circle.position.set(SPRITE_SCENE.circlePositionX, SPRITE_SCENE.circlePositionY);
  circle.on('pointerdown', () => console.log('green-circle pointerdown!'));
  container.addChild(circle);

  try {
    const texture = await loadSampleTexture();
    const sprite = new Sprite(texture);
    sprite.name = 'logo-sprite';
    sprite.eventMode = PIXI_INTERACTIVE_MODE.static;
    sprite.position.set(SPRITE_SCENE.spritePositionX, SPRITE_SCENE.spritePositionY);
    sprite.scale.set(SPRITE_SCENE.spriteScale);
    sprite.on('pointerup', () => console.log('logo-sprite pointerup!'));
    container.addChild(sprite);
  } catch (error) {
    console.warn('Failed to load sprite texture:', error);
  }

  const line = makeInteractiveGraphics('purple-line');
  line.lineStyle(SPRITE_SCENE.lineWidth, DEMO_COLORS.purple, 1)
    .moveTo(SPRITE_SCENE.lineStartX, SPRITE_SCENE.lineStartY)
    .lineTo(SPRITE_SCENE.lineEndX, SPRITE_SCENE.lineEndY);
  container.addChild(line);

  return container;
}

function createRandomScene(): Container {
  const container = new Container();

  for (let index = 0; index < RANDOM_SCENE.shapeCount; index += 1) {
    const graphics = makeInteractiveGraphics(`shape-${index}`);
    const color = Math.floor(Math.random() * COLOR_RANDOM_MAX);
    const x = Math.random() * (SCENE_WIDTH - RANDOM_SCENE.positionMargin);
    const y = Math.random() * (SCENE_HEIGHT - RANDOM_SCENE.positionMargin);

    if (index % 3 === 0) {
      graphics
        .beginFill(color, RANDOM_SCENE.fillAlpha)
        .drawRect(0, 0, RANDOM_SCENE.rectWidth, RANDOM_SCENE.rectHeight)
        .endFill();
    } else if (index % 3 === 1) {
      graphics
        .beginFill(color, RANDOM_SCENE.fillAlpha)
        .drawCircle(0, 0, RANDOM_SCENE.circleRadius)
        .endFill();
    } else {
      graphics
        .lineStyle(RANDOM_SCENE.lineWidth, color, 1)
        .moveTo(0, 0)
        .lineTo(RANDOM_SCENE.lineLength, Math.random() * RANDOM_SCENE.lineHeightRange);
    }

    graphics.position.set(x, y);
    graphics.angle = Math.random() * RANDOM_SCENE.angleRange - RANDOM_SCENE.angleOffset;
    graphics.scale.set(RANDOM_SCENE.scaleMin + Math.random() * RANDOM_SCENE.scaleRange);
    container.addChild(graphics);
  }

  return container;
}

async function loadSampleTexture(): Promise<Texture> {
  const { size, font, label, textX, textY } = SAMPLE_TEXTURE;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, SAMPLE_TEXTURE_GRADIENT.start);
  gradient.addColorStop(1, SAMPLE_TEXTURE_GRADIENT.end);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = SAMPLE_TEXTURE_GRADIENT.text;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(label, textX, textY);

  return Texture.from(canvas);
}

const SCENE_BUILDERS: SceneBuilder[] = [
  { name: 'Демо (задание)', build: createDemoScene },
  { name: 'Спрайт + фигуры', build: createSpriteScene },
  { name: 'Случайные элементы', build: createRandomScene },
];

export {
  SCENE_WIDTH,
  SCENE_HEIGHT,
  SCENE_BUILDERS,
  createDemoScene,
  createSpriteScene,
  createRandomScene,
};

export type { SceneBuilder };
