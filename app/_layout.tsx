import { AuthProvider, useAuth } from '@/context/auth';
import { initializeDatabase } from '@/database/database';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export default function RootLayout() {
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

  // Wait for the saved session so a signed-in owner never sees the sign-in screen flash.
  if (isLoading) {
    return null;
  }

  const isSignedIn = owner !== null;

  // When a guard turns false, Expo Router sends the user to the anchor route (app/index.tsx),
  // which redirects to the right place for the new sign-in state.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pets/new" />
          <Stack.Screen name="pets/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}
