import { darkColors, lightColors, type Palette } from '@/constants/colors';
import fs from 'node:fs';
import path from 'node:path';

// global.css is generated from constants/colors.ts (npm run generate-theme). Each variable line
// records which palette key it came from, e.g. "--primary: 257.8 70% 59.4%; /* primary #7A4FE0 */".
const css = fs.readFileSync(path.join(__dirname, '..', 'global.css'), 'utf8');
const VARIABLE_LINE = /--([\w-]+):\s*([\d.]+) ([\d.]+)% ([\d.]+)%;\s*\/\* (\w+) (#[0-9A-Fa-f]{6}) \*\//g;

function section(selector: string) {
  const start = css.indexOf(selector);
  const end = css.indexOf('}', start);
  if (start < 0 || end < 0) throw new Error(`global.css has no ${selector} block`);
  return [...css.slice(start, end).matchAll(VARIABLE_LINE)].map(([, variable, h, s, l, key, hex]) => ({
    variable,
    hsl: [Number(h), Number(s), Number(l)] as const,
    key,
    hex,
  }));
}

function hslToRgb([h, s, l]: readonly [number, number, number]) {
  const saturation = s / 100;
  const lightness = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [channel(0), channel(8), channel(4)].map((value) => Math.round(value * 255));
}

function hexToRgb(hex: string) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

describe.each([
  [':root {', 'light', lightColors],
  ['.dark:root {', 'dark', darkColors],
])('global.css %s', (selector, _name, palette: Palette) => {
  const variables = section(selector);

  it('defines every variable React Native Reusables needs', () => {
    expect(variables.map((v) => v.variable)).toEqual(
      expect.arrayContaining(['background', 'foreground', 'primary', 'primary-foreground', 'border', 'ring', 'destructive'])
    );
  });

  it.each(variables.map((v) => [v.variable, v] as const))('keeps --%s in step with constants/colors.ts', (_variable, v) => {
    expect(palette[v.key as keyof Palette]?.toUpperCase()).toBe(v.hex.toUpperCase());
    hslToRgb(v.hsl).forEach((channel, index) => {
      expect(Math.abs(channel - hexToRgb(v.hex)[index])).toBeLessThanOrEqual(1);
    });
  });
});
