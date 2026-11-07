import { darkColors, lightColors, type Palette } from '@/constants/colors';

/** WCAG contrast ratio between two #RRGGBB colors (1 to 21). */
function contrast(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((start) => {
      const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// Text and background pairs the screens actually use. 4.5:1 is the WCAG AA minimum for normal text.
const TEXT_PAIRS: [keyof Palette, keyof Palette][] = [
  ['text', 'surface'],
  ['text', 'page'],
  ['muted', 'surface'],
  ['muted', 'page'],
  ['onPrimary', 'primary'],
  ['primary', 'surface'],
  ['accentText', 'surface'],
  ['heartText', 'surface'],
  ['danger', 'dangerSoft'],
  ['text', 'primarySoft'],
];

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
])('%s palette', (_name, palette) => {
  it.each(TEXT_PAIRS)('keeps %s readable on %s', (foreground, background) => {
    expect(contrast(palette[foreground], palette[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('uses only #RRGGBB colors', () => {
    for (const value of Object.values(palette)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

it('gives both palettes the same color names', () => {
  expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
});
