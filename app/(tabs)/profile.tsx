import { useAuth } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, POSTS, STORIES } from '../../data/pets';

export default function ProfileScreen() {
  const { owner, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // Clearing the owner flips the route guards, which return the user to sign-in.
      await signOut();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover} />
        <View style={styles.profileCard}>
          <Image source={{ uri: STORIES[0].avatar }} style={styles.avatar} />
          <Text style={styles.name}>Mochi</Text>
          <Text style={styles.username}>@sarahkim</Text>
          <Text style={styles.bio}>Garden explorer, treat lover, and certified nap expert. 🐾</Text>
          <View style={styles.stats}>
            <Stat label="Posts" value="24" />
            <Stat label="Friends" value="1.8K" />
            <Stat label="Likes" value="8.4K" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Posts</Text>
        <View style={styles.grid}>
          {POSTS.map((post) => <Image key={post.id} source={{ uri: post.image }} style={styles.gridImage} />)}
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{owner?.fullName}</Text>
            <Text style={styles.accountEmail}>{owner?.email}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            accessibilityState={{ disabled: signingOut, busy: signingOut }}
            disabled={signingOut}
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutPressed]}
          >
            {signingOut ? (
              <ActivityIndicator color={COLORS.blue} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color={COLORS.blue} />
                <Text style={styles.signOutText}>Sign out</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  cover: { height: 120, backgroundColor: COLORS.blue },
  profileCard: { backgroundColor: COLORS.white, alignItems: 'center', padding: 18, marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: COLORS.white, marginTop: -66 },
  name: { fontSize: 26, color: COLORS.dark, fontWeight: '800', marginTop: 8 },
  username: { color: COLORS.muted, marginTop: 2 },
  bio: { color: COLORS.dark, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  stats: { flexDirection: 'row', marginTop: 18, width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: '800', fontSize: 18, color: COLORS.blue },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  sectionTitle: { marginHorizontal: 16, marginBottom: 10, color: COLORS.dark, fontSize: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6 },
  gridImage: { width: '31.8%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#D8E4F7' },
  accountCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 24, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountInfo: { flex: 1 },
  accountName: { color: COLORS.dark, fontWeight: '700', fontSize: 15 },
  accountEmail: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, minWidth: 110, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 14, backgroundColor: COLORS.bg },
  signOutPressed: { opacity: 0.7 },
  signOutText: { color: COLORS.blue, fontWeight: '700' },
});
