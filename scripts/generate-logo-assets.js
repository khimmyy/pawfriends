/**
 * Draws the PawFriends paw logo (constants/logo-shape.json) into the image files
 * that app.json points at, plus assets/images/logo.svg.
 *
 * Run after changing the logo shape or colors:  npm run generate-logo
 *
 * Each pixel is sampled SAMPLES x SAMPLES times to smooth the edges.
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const LOGO = require('../constants/logo-shape.json');

// Keep in step with constants/colors.ts (primary, page and heart in both palettes).
const COLORS = {
  primary: '#7A4FE0',
  light: '#F6F3FF',
  heart: '#FF8A65',
  // Dark theme (darkColors in constants/colors.ts).
  primaryDark: '#A78BFA',
  heartDark: '#FF9A7A',
  white: '#FFFFFF',
  transparent: '#00000000',
};
const SAMPLES = 4;
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images');

function hexToRgba(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    value.length === 8 ? parseInt(value.slice(6, 8), 16) : 255,
  ].map((channel, index) => (index === 3 ? channel / 255 : channel));
}

// ---- Shapes, in logo units (0–100) ---------------------------------------

function insideEllipse(x, y, { cx, cy, rx, ry, rotate = 0 }) {
  const angle = (-rotate * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
  return (localX / rx) ** 2 + (localY / ry) ** 2 <= 1;
}

/** Point-in-polygon for a convex polygon: the point is on the same side of every edge. */
function insideConvexPolygon(x, y, points) {
  let hasNegative = false;
  let hasPositive = false;
  points.forEach(([ax, ay], index) => {
    const [bx, by] = points[(index + 1) % points.length];
    const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
    if (cross < 0) hasNegative = true;
    if (cross > 0) hasPositive = true;
  });
  return !(hasNegative && hasPositive);
}

function insidePaw(x, y) {
  return LOGO.toes.some((toe) => insideEllipse(x, y, toe)) || insideEllipse(x, y, LOGO.pad);
}

function insideHeart(x, y) {
  return (
    LOGO.heart.circles.some(({ cx, cy, r }) => insideEllipse(x, y, { cx, cy, rx: r, ry: r })) ||
    insideConvexPolygon(x, y, LOGO.heart.points)
  );
}

function insideRoundedSquare(x, y, size, radius) {
  const nearestX = Math.min(Math.max(x, radius), size - radius);
  const nearestY = Math.min(Math.max(y, radius), size - radius);
  return x >= 0 && y >= 0 && x <= size && y <= size && (x - nearestX) ** 2 + (y - nearestY) ** 2 <= radius ** 2;
}

// ---- Rendering ------------------------------------------------------------

/**
 * Renders an image of `size` pixels. `logoScale` is the logo's width as a share of the image.
 * `layers` are drawn in order; each has a color and an `inside(x, y)` test in logo units,
 * or `pixel: true` for a test in pixels (backgrounds).
 */
function render({ size, logoScale, background = COLORS.transparent, layers }) {
  const png = new PNG({ width: size, height: size });
  const logoPixels = size * logoScale;
  const offset = (size - logoPixels) / 2;
  const toLogo = (pixel) => ((pixel - offset) / logoPixels) * LOGO.viewBox;
  const backgroundRgba = hexToRgba(background);
  const layerColors = layers.map((layer) => hexToRgba(layer.color));

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let [r, g, b, a] = backgroundRgba;
      r *= a;
      g *= a;
      b *= a;

      layers.forEach((layer, index) => {
        let hits = 0;
        for (let sy = 0; sy < SAMPLES; sy++) {
          for (let sx = 0; sx < SAMPLES; sx++) {
            const x = px + (sx + 0.5) / SAMPLES;
            const y = py + (sy + 0.5) / SAMPLES;
            const inside = layer.pixel ? layer.inside(x, y) : layer.inside(toLogo(x), toLogo(y));
            if (inside) hits++;
          }
        }
        const coverage = (hits / (SAMPLES * SAMPLES)) * layerColors[index][3];
        if (coverage === 0) return;
        if (layer.erase) {
          // Cut a hole: reduce what is already there.
          r *= 1 - coverage;
          g *= 1 - coverage;
          b *= 1 - coverage;
          a *= 1 - coverage;
          return;
        }
        // Source-over compositing with premultiplied color.
        const [lr, lg, lb] = layerColors[index];
        r = lr * coverage + r * (1 - coverage);
        g = lg * coverage + g * (1 - coverage);
        b = lb * coverage + b * (1 - coverage);
        a = coverage + a * (1 - coverage);
      });

      const offsetIndex = (py * size + px) * 4;
      png.data[offsetIndex] = a > 0 ? Math.round(r / a) : 0;
      png.data[offsetIndex + 1] = a > 0 ? Math.round(g / a) : 0;
      png.data[offsetIndex + 2] = a > 0 ? Math.round(b / a) : 0;
      png.data[offsetIndex + 3] = Math.round(a * 255);
    }
  }
  return png;
}

function save(fileName, png, { opaque = false } = {}) {
  const buffer = PNG.sync.write(png, opaque ? { colorType: 2 } : { colorType: 6 });
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buffer);
  console.log(`Wrote assets/images/${fileName} (${png.width}x${png.height})`);
}

const paw = (color) => ({ color, inside: insidePaw });
const heart = (color) => ({ color, inside: insideHeart });

// App icon (iOS needs it opaque): light paw on brand violet.
save('icon.png', render({ size: 1024, logoScale: 0.66, background: COLORS.primary, layers: [paw(COLORS.light), heart(COLORS.heart)] }), {
  opaque: true,
});

// Android adaptive icon: violet background layer, paw foreground kept inside the central safe zone.
save('android-icon-background.png', render({ size: 512, logoScale: 1, background: COLORS.primary, layers: [] }));
save('android-icon-foreground.png', render({ size: 512, logoScale: 0.5, layers: [paw(COLORS.light), heart(COLORS.heart)] }));
// Monochrome (themed) icon: only the shape is used, so the heart is cut out to stay visible.
save(
  'android-icon-monochrome.png',
  render({ size: 432, logoScale: 0.5, layers: [paw(COLORS.white), { ...heart(COLORS.white), erase: true }] })
);

// Splash image: violet paw on a transparent background; app.json sets the lavender color behind it.
save('splash-icon.png', render({ size: 1024, logoScale: 0.92, layers: [paw(COLORS.primary), heart(COLORS.heart)] }));
// Dark-mode splash image: the lighter violet paw, shown on the dark background set in app.json.
save('splash-icon-dark.png', render({ size: 1024, logoScale: 0.92, layers: [paw(COLORS.primaryDark), heart(COLORS.heartDark)] }));

// Browser tab icon: the app icon as a rounded square.
save(
  'favicon.png',
  render({
    size: 48,
    logoScale: 0.74,
    layers: [
      { color: COLORS.primary, pixel: true, inside: (x, y) => insideRoundedSquare(x, y, 48, 11) },
      paw(COLORS.light),
      heart(COLORS.heart),
    ],
  })
);

// Vector copy of the logo for anything else (web, documents, print).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.viewBox} ${LOGO.viewBox}" role="img" aria-label="PawFriends logo">
  <g fill="${COLORS.primary}">
${LOGO.toes
  .map((toe) => `    <ellipse cx="${toe.cx}" cy="${toe.cy}" rx="${toe.rx}" ry="${toe.ry}" transform="rotate(${toe.rotate} ${toe.cx} ${toe.cy})"/>`)
  .join('\n')}
    <ellipse cx="${LOGO.pad.cx}" cy="${LOGO.pad.cy}" rx="${LOGO.pad.rx}" ry="${LOGO.pad.ry}"/>
  </g>
  <g fill="${COLORS.heart}">
${LOGO.heart.circles.map(({ cx, cy, r }) => `    <circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('\n')}
    <polygon points="${LOGO.heart.points.map(([x, y]) => `${x},${y}`).join(' ')}"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'logo.svg'), svg);
console.log('Wrote assets/images/logo.svg');
