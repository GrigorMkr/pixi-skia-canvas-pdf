# PIXI + Skia PDF

TypeScript-приложение: рендер `PIXI.Container` через Skia (CanvasKit WASM) и экспорт в векторный PDF.

Репозиторий: https://github.com/GrigorMkr/pixi-skia-canvas-pdf

## Запуск

```bash
npm install
npm start
```

Откроется http://localhost:5173

```bash
npm run build   # production
npm run lint    # ESLint + Stylelint
```

## Возможности

- PIXI 7.2.4 legacy (`forceCanvas: true`) + зеркальный Skia canvas
- `convertPixiContainerToSkia()` — Graphics (вектор) и Sprite (bitmap)
- `pointerdown` / `pointerup` на обоих canvas
- Кнопки: случайная фигура, переключение сцен, экспорт PDF

## Структура

```
src/
├── app.ts
├── pixi/          # PIXI app и сцены
├── skia/          # convertPixiContainerToSkia, PDF export
├── events/        # hit-test для Skia canvas
└── styles/
```

## Деплой

Vercel или Netlify: build `npm run build`, output `dist/` (конфиги уже в проекте).

## Сдача

1. GitHub + живое демо на хостинге  
2. PDF из приложения в репозитории (например `samples/demo-scene-1.pdf`)  
3. Форма: https://forms.yandex.ru/u/6a0db569eb6146662ae0fb45
