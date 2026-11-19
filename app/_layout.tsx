// Tailwind styles for NativeWind / React Native Reusables. Must be imported first, in the root layout.
import '../global.css';

import { AnimatedSplash } from '@/components/animated-splash';
import { BRAND_FONT_FILES } from '@/constants/fonts';
import { AuthProvider, useAuth } from '@/context/auth';
import { ThemeProvider, useTheme } from '@/context/theme';
import { initializeDatabase } from '@/database/database';
import { NAV_THEME } from '@/lib/theme';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
// Since SDK 56, the navigation theme API is imported from Expo Router, not from React Navigation itself.
import { ThemeProvider as NavigationThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

// Keep the native splash up while the database opens; AnimatedSplash hides it once it is on screen.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (for example after a fast refresh in development).
});

export default function RootLayout() {
  // Load the brand font while the native splash is still up, so text never appears in the wrong font.
  // If it fails to load, carry on with the system font rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts(BRAND_FONT_FILES);
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SQLiteProvider databaseName="pawfriends.db" onInit={initializeDatabase}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}

function RootNavigator() {
  const { owner, isLoading } = useAuth();
  const { colors, scheme, ready: themeReady } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  const isSignedIn = owner !== null;

  // Screen backgrounds and transitions use the same palette (lib/theme.ts).
  return (
    <NavigationThemeProvider value={NAV_THEME[scheme]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: colors.page }]}>
        {/* Wait for the saved session so a signed-in owner never sees the sign-in screen flash.
            When a guard turns false, Expo Router sends the user to the anchor route (app/index.tsx),
            which redirects to the right place for the new sign-in state. */}
        {isLoading ? null : (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page } }}>
            <Stack.Screen name="index" />

            <Stack.Protected guard={isSignedIn}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pets/new" />
              <Stack.Screen name="pets/[id]" />
              <Stack.Screen name="posts/new" />
              <Stack.Screen name="posts/saved" />
              <Stack.Screen name="posts/[id]" />
            </Stack.Protected>

            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </Stack.Protected>
          </Stack>
        )}

        {/* Waits for the saved appearance too, so the first screen appears in the right theme. */}
        {splashDone ? null : <AnimatedSplash ready={!isLoading && themeReady} onFinish={finishSplash} />}
      </View>
      {/* Where Reusables menus, popovers and tooltips render, above everything else. */}
      <PortalHost />
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
