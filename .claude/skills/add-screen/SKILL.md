---
name: add-screen
description: Add a new screen, route, or bottom tab to the PawFriends Expo Router app following its layout, styling, and navigation conventions. Use when asked to create a page, screen, tab, or detail view.
---

# Add a screen

## Choose where it goes

- **New bottom tab**: create `app/(tabs)/<name>.tsx` and register it in `app/(tabs)/_layout.tsx` with a `<Tabs.Screen name="<name>" options={{ title, tabBarIcon }} />`. Tabs appear in the order they are listed. Five tabs already exist; ask before adding a sixth.
- **Pushed screen** (detail view, form): create `app/<name>.tsx`, or `app/<group>/[id].tsx` for a dynamic route. The root `Stack` in `app/_layout.tsx` hides headers, so the screen draws its own header and back control.
- Navigate with `router.push("/path")` / `router.replace(...)` from `expo-router` or `<Link href>`. Paths are type-checked (typed routes), so run the type check after adding a route.

## Screen template

Match the existing tab screens (`veterinary.tsx`, `notifications.tsx`):

```tsx
import { COLORS } from '@/data/pets';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExampleScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Title</Text>
        <Text style={styles.subtitle}>Short description</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {/* content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.08)' },
  title: { fontSize: 25, fontWeight: '800', color: COLORS.blue },
  subtitle: { color: COLORS.muted, marginTop: 4 },
  list: { padding: 16, gap: 12 },
});
```

## Rules

- One default-exported component per route file; return JSX directly; helper components go at module level, never inside the screen.
- Use `COLORS` instead of new hex values. Use `Ionicons` names typed as `keyof typeof Ionicons.glyphMap` instead of `as any`.
- Mock data goes in `data/pets.ts` with an explicit type; persistent data goes through `database/database.ts`.
- Every `Pressable`/`TouchableOpacity` gets an `accessibilityLabel` and either a real handler or a clear TODO.
- List items need a stable `key` (an id, not the array index).

## Verify

Run `npm run lint` and `npx tsc --noEmit`, then open the screen (`npm run web` is quickest) and confirm it renders and navigation works. Report which platforms you checked.
