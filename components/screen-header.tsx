import { COLORS } from '@/data/pets';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
};

/** A white header bar with a back button, for screens pushed on top of the tabs. */
export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={COLORS.dark} />
      </Pressable>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.08)' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.dark },
});
