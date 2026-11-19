import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';

/**
 * Fredoka is the brand typeface: rounded and chunky like the paw logo's toe beans.
 * Use it for the "PawFriends" name and brand titles, not body text. Set `fontFamily`
 * alone (no `fontWeight`), since each weight is its own font file.
 */
export const BRAND_FONTS = {
  bold: 'Fredoka_700Bold',
  semiBold: 'Fredoka_600SemiBold',
} as const;

/** Passed to useFonts in app/_layout.tsx so the fonts load before the first screen. */
export const BRAND_FONT_FILES = {
  Fredoka_700Bold,
  Fredoka_600SemiBold,
};
