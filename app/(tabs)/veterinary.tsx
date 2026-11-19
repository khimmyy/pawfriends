import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';

const SERVICES = [
  { icon: 'medkit-outline', title: 'Vet Checkup', desc: 'Book regular checkups for your pet.' },
  { icon: 'shield-checkmark-outline', title: 'Vaccination', desc: 'Track vaccine schedules and records.' },
  { icon: 'calendar-outline', title: 'Appointments', desc: 'Manage upcoming veterinary visits.' },
  { icon: 'call-outline', title: 'Emergency Contact', desc: 'Save important clinic numbers.' },
];

export default function VeterinaryScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Health</Text>
        <Text style={styles.subtitle}>Care reminders and vet services</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {SERVICES.map((item) => (
          <View key={item.title} style={styles.card}>
            <View style={styles.iconBox}><Ionicons name={item.icon as any} size={24} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.page },
  header: { backgroundColor: c.surface, padding: 18, borderBottomWidth: 1, borderBottomColor: c.border },
  title: { fontSize: 25, fontWeight: '800', color: c.primary },
  subtitle: { color: c.muted, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: c.surface, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: c.page, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { color: c.text, fontSize: 16, fontWeight: '800' },
  description: { color: c.muted, marginTop: 3, lineHeight: 19 },
});
