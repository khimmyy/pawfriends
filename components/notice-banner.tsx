import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import { StyleSheet, Text, View } from 'react-native';

/** A short message pinned to the bottom of a screen, such as "Saved" or "Copied". */
export function NoticeBanner({ message }: { message: string | null }) {
  const colors = useColors();
  const styles = createStyles(colors);
  if (!message) {
    return null;
  }
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite" pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: c.text,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  // Inverted: dark banner in light mode, light banner in dark mode.
  text: { color: c.page, fontWeight: '600', textAlign: 'center' },
});
