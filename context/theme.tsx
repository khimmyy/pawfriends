import { PALETTES, type ColorScheme, type Palette } from '@/constants/colors';
import { getSetting, setSetting } from '@/database/database';
import { useSQLiteContext } from 'expo-sqlite';
import { colorScheme as nativeWindColorScheme } from 'nativewind';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Platform, useColorScheme } from 'react-native';

/** "system" follows the phone's light or dark setting. */
export type AppearancePreference = 'system' | ColorScheme;

const SETTING_KEY = 'appearance';
const PREFERENCES: AppearancePreference[] = ['system', 'light', 'dark'];

type ThemeContextValue = {
  /** The palette for the scheme in use. */
  colors: Palette;
  /** The scheme in use after resolving "system". */
  scheme: ColorScheme;
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => Promise<void>;
  /** False until the saved preference has been read, so the first screen uses the right theme. */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: string | null): value is AppearancePreference {
  return value !== null && (PREFERENCES as string[]).includes(value);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSetting(db, SETTING_KEY)
      .then((saved) => {
        if (!cancelled && isPreference(saved)) {
          setPreferenceState(saved);
        }
      })
      .catch(() => {
        // Fall back to following the system setting.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const setPreference = async (next: AppearancePreference) => {
    setPreferenceState(next);
    await setSetting(db, SETTING_KEY, next);
  };

  const scheme: ColorScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  // Keep NativeWind (Tailwind classes in React Native Reusables components) on the same scheme.
  // On phones "system" is passed through so it keeps following the device; on the web NativeWind
  // only toggles a "dark" class and treats "system" as light, so it gets the resolved scheme.
  useEffect(() => {
    nativeWindColorScheme.set(Platform.OS === 'web' ? scheme : preference);
  }, [preference, scheme]);

  return (
    <ThemeContext.Provider value={{ colors: PALETTES[scheme], scheme, preference, setPreference, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider.');
  }
  return context;
}

/** The active palette. Use this in every component that draws colors. */
export function useColors() {
  return useTheme().colors;
}
