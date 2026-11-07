import { AnimatedSplash } from '@/components/animated-splash';
import { BRAND_FONT_FILES } from '@/constants/fonts';
import { AuthProvider, useAuth } from '@/context/auth';
import { initializeDatabase } from '@/database/database';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
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
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}

function RootNavigator() {
  const { owner, isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  const isSignedIn = owner !== null;

  return (
    <View style={styles.root}>
      {/* Wait for the saved session so a signed-in owner never sees the sign-in screen flash.
          When a guard turns false, Expo Router sends the user to the anchor route (app/index.tsx),
          which redirects to the right place for the new sign-in state. */}
      {isLoading ? null : (
        <Stack screenOptions={{ headerShown: false }}>
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

      {splashDone ? null : <AnimatedSplash ready={!isLoading} onFinish={finishSplash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
