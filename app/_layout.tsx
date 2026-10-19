import { initializeDatabase } from '@/database/database';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="pawfriends.db" onInit={initializeDatabase}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
