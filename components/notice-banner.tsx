import { COLORS } from '@/data/pets';
import { StyleSheet, Text, View } from 'react-native';

/** A short message pinned to the bottom of a screen, such as "Saved" or "Copied". */
export function NoticeBanner({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite" pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.dark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: { color: COLORS.white, fontWeight: '600', textAlign: 'center' },
});
