import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';

const ACTIVITIES = [
  'Mochi liked your post.',
  'Luna commented on your photo.',
  'Buddy is available for adoption near you.',
  'Vet reminder: vaccine schedule tomorrow.',
];

export default function NotificationsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Your latest PawFriends updates</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {ACTIVITIES.map((activity, index) => (
          <View key={activity} style={styles.card}>
            <View style={styles.iconBox}><Ionicons name="notifications-outline" size={21} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>{activity}</Text>
              <Text style={styles.time}>{index + 1}h ago</Text>
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
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: c.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.page, alignItems: 'center', justifyContent: 'center' },
  text: { color: c.text, fontWeight: '600' },
  time: { color: c.muted, fontSize: 12, marginTop: 4 },
});
