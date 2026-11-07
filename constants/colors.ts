/**
 * The PawFriends palettes ("cozy and modern"): violet with ink text on pale lavender,
 * mint and coral accents, in a light and a dark version. Screens get the active one
 * from useColors() in context/theme.tsx; never import a palette into a screen directly.
 *
 * Both palettes have the same keys. The *Text variants are shades of an accent that
 * stay readable as small text on `surface`. The logo script and app.json repeat a few
 * light values (primary, page, heart) and the dark `page`; change them together.
 */
export const lightColors = {
  /** Main brand color: buttons, logo, active tab, the sign-in header. */
  primary: '#7A4FE0',
  primaryPressed: '#6339CC',
  /** Pale violet for selected chips, info messages and icon tiles. */
  primarySoft: '#EDE6FF',
  /** Text and icons placed on `primary`. */
  onPrimary: '#FFFFFF',
  /** Secondary text on `primary`, such as the sign-in tagline. */
  onPrimaryMuted: '#E3D9FF',

  /** Headings and body text. */
  text: '#221B3A',
  /** Secondary text, placeholders, inactive icons. */
  muted: '#6F6890',

  /** Screen background. */
  page: '#F6F3FF',
  /** Cards, headers, sheets and the tab bar. */
  surface: '#FFFFFF',
  border: '#E7E1F7',
  /** Shown behind images while they load. */
  imagePlaceholder: '#E4DCFA',

  /** Mint: saved posts and positive accents. */
  accent: '#24C6A0',
  accentText: '#0E7F64',

  /** Coral: the heart in the logo and liked posts. */
  heart: '#FF8A65',
  heartText: '#C2452B',

  /** Errors (a raspberry red, distinct from the coral heart). */
  danger: '#C8325B',
  dangerSoft: '#FDECF1',
};

export type Palette = typeof lightColors;

/**
 * Dark version: a lighter violet with dark text on it (white on light violet is too faint),
 * deep plum-black backgrounds, and brighter accents.
 */
export const darkColors: Palette = {
  primary: '#A78BFA',
  primaryPressed: '#8E6FF0',
  primarySoft: '#2C2347',
  onPrimary: '#1A1033',
  onPrimaryMuted: '#2E2052',

  text: '#EDE9FF',
  muted: '#A9A2C4',

  page: '#13101C',
  surface: '#1D1929',
  border: '#2F2944',
  imagePlaceholder: '#2A2440',

  accent: '#34D3AE',
  accentText: '#5EE0C0',

  heart: '#FF9A7A',
  heartText: '#FFA88C',

  danger: '#FF6B8B',
  dangerSoft: '#3A1A26',
};

export type ColorScheme = 'light' | 'dark';

export const PALETTES: Record<ColorScheme, Palette> = { light: lightColors, dark: darkColors };
