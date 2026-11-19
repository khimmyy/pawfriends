import { type Palette } from '@/constants/colors';
import { useColors, useTheme, type AppearancePreference } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const OPTIONS: { value: AppearancePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

/** System / Light / Dark switch. The choice is saved on this device. */
export function AppearancePicker() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { preference, setPreference } = useTheme();

  return (
    <View style={styles.card}>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Appearance">
        {OPTIONS.map((option) => {
          const selected = option.value === preference;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => {
                setPreference(option.value).catch(() => {
                  // The theme still changes for this session even if saving fails.
                });
              }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Ionicons name={option.icon} size={18} color={selected ? colors.onPrimary : colors.muted} />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>System follows your phone’s light or dark setting.</Text>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 12 },
    options: { flexDirection: 'row', gap: 8, backgroundColor: c.page, borderRadius: 12, padding: 4 },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minHeight: 44,
      borderRadius: 10,
    },
    optionSelected: { backgroundColor: c.primary },
    optionText: { color: c.muted, fontWeight: '600' },
    optionTextSelected: { color: c.onPrimary, fontWeight: '700' },
    hint: { color: c.muted, fontSize: 12, marginTop: 8, marginHorizontal: 4 },
  });
