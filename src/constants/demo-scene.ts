import { SCENE_WIDTH, SCENE_HEIGHT } from './scene';

export const DEMO_G1 = {
  ellipseRadiusX: 200,
  ellipseRadiusY: 100,
  positionX: 200,
  positionY: 100,
  angle: 30,
} as const;

export const DEMO_G2 = {
  rectX: -50,
  rectY: -75,
  rectWidth: 100,
  rectHeight: 150,
  positionX: 120,
  positionY: 60,
  angle: 15,
  scaleX: 1.5,
  scaleY: 1.7,
} as const;

export const DEMO_G3 = {
  lineWidth: 10,
  lineEndX: 150,
  lineEndY: 100,
  angle: -20,
} as const;

export const DEMO_G4 = {
  lineWidth: 10,
  moveY: 70,
  lineEndX: 150,
  lineEndY: -30,
  angle: 20,
} as const;

export const DEMO_SUB_CONTAINER = {
  positionX: 75,
  positionY: 50,
} as const;

export const SPRITE_SCENE = {
  circleRadius: 60,
  circlePositionX: 150,
  circlePositionY: 200,
  spritePositionX: 400,
  spritePositionY: 150,
  spriteScale: 0.5,
  lineWidth: 8,
  lineStartX: 50,
  lineStartY: 400,
  lineEndX: 750,
  lineEndY: 350,
} as const;

export const SAMPLE_TEXTURE = {
  size: 128,
  font: 'bold 24px sans-serif',
  label: 'PNG',
  textX: 64,
  textY: 70,
} as const;

export const RANDOM_SCENE = {
  shapeCount: 12,
  positionMargin: 100,
  fillAlpha: 0.8,
  rectWidth: 80,
  rectHeight: 60,
  circleRadius: 40,
  lineWidth: 4,
  lineLength: 100,
  lineHeightRange: 80,
  angleRange: 60,
  angleOffset: 30,
  scaleMin: 0.8,
  scaleRange: 0.6,
} as const;

export const SCENE_BACKGROUND = {
  width: SCENE_WIDTH,
  height: SCENE_HEIGHT,
} as const;
