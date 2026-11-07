/**
 * The PawFriends palette ("cozy and modern"): violet with ink text on pale lavender,
 * mint and coral accents. Every screen reads its colors from here; the logo and app
 * icons use the same values in scripts/generate-logo-assets.js and app.json.
 *
 * The *Text variants are darker shades for small text on white, where the bright
 * accents would be too faint to read.
 */
export const COLORS = {
  /** Main brand color: buttons, logo, active tab, links in the brand voice. */
  primary: '#7A4FE0',
  primaryPressed: '#6339CC',
  /** Pale violet for selected chips, info messages and icon tiles. */
  primarySoft: '#EDE6FF',
  /** Light text on primary backgrounds, such as the sign-in tagline. */
  onPrimaryMuted: '#E3D9FF',

  /** Ink: headings and body text. */
  text: '#221B3A',
  /** Lavender gray: secondary text, placeholders, inactive icons. */
  muted: '#7D769A',

  /** Pale lavender page background. */
  page: '#F6F3FF',
  white: '#FFFFFF',
  border: '#E7E1F7',
  /** Placeholder behind images while they load. */
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
} as const;
