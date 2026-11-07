import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
};

/** A white header bar with a back button, for screens pushed on top of the tabs. */
export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: c.text },
});
