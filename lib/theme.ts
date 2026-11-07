import { darkColors, lightColors, type ColorScheme, type Palette } from '@/constants/colors';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

/**
 * React Native Reusables' theme (THEME) and the navigation theme (NAV_THEME), both built from
 * the app palettes in constants/colors.ts. global.css carries the same values as CSS variables
 * (npm run generate-theme).
 */
function toReusablesTheme(c: Palette) {
  return {
    background: c.page,
    foreground: c.text,
    card: c.surface,
    cardForeground: c.text,
    popover: c.surface,
    popoverForeground: c.text,
    primary: c.primary,
    primaryForeground: c.onPrimary,
    secondary: c.primarySoft,
    secondaryForeground: c.text,
    muted: c.page,
    mutedForeground: c.muted,
    // Reusables' "accent" is a hover/pressed tint, not the app's mint accent.
    accent: c.primarySoft,
    accentForeground: c.text,
    destructive: c.danger,
    border: c.border,
    input: c.border,
    ring: c.primary,
    radius: '0.875rem',
  };
}

export const THEME = {
  light: toReusablesTheme(lightColors),
  dark: toReusablesTheme(darkColors),
};

function toNavigationTheme(base: Theme, c: Palette): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      background: c.page,
      border: c.border,
      card: c.surface,
      notification: c.heart,
      primary: c.primary,
      text: c.text,
    },
  };
}

/** Screen backgrounds, headers and transitions for Expo Router, per scheme. */
export const NAV_THEME: Record<ColorScheme, Theme> = {
  light: toNavigationTheme(DefaultTheme, lightColors),
  dark: toNavigationTheme(DarkTheme, darkColors),
};
