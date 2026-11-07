import { PawLogo } from '@/components/paw-logo';
import { useAuth } from '@/context/auth';
import { getPetsForOwner, type Pet } from '@/database/database';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { POSTS } from '@/data/pets';

export default function ProfileScreen() {
  const { owner, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const db = useSQLiteContext();
  const [pets, setPets] = useState<Pet[]>([]);


  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // Clearing the owner flips the route guards, which return the user to sign-in.
      await signOut();
    } catch {
      setSigningOut(false);
    }
  };

   useFocusEffect(
    useCallback(() => {
      if (!owner) {
        return;
      }
      let active = true;
      getPetsForOwner(db, owner.id)
        .then((result) => {
          if (active) setPets(result);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [db, owner])
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover} />
        <View style={styles.profileCard}>
            
            {pets[0]?.photoUri ? (
            <Image source={{ uri: pets[0].photoUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <PawLogo size={56} accessibilityLabel={null} />
                </View>
              )}
            <Text style={styles.name}>{owner?.fullName}</Text>
            <Text style={styles.username}>{owner?.email}</Text>

          <View style={styles.stats}>
            <Stat label="Posts" value="24" />
            <Stat label="Friends" value="1.8K" />
            <Stat label="Likes" value="8.4K" />
          </View>
        </View>

          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInline}>My Pets</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add a pet"
                onPress={() => router.push('/pets/new')}
                style={styles.addPetButton}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.addPetText}>Add pet</Text>
              </Pressable>
            </View>

            {pets.length === 0 ? (
              <Text style={styles.emptyText}>No pets yet. Add your first one!</Text>
            ) : (
              pets.map((pet) => (
                <Pressable
                  key={pet.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${pet.name}`}
                  onPress={() => router.push({ pathname: '/pets/[id]', params: { id: String(pet.id) } })}
                  style={styles.petRow}
                >
                  {pet.photoUri ? (
                    <Image source={{ uri: pet.photoUri }} style={styles.petPhoto} />
                  ) : (
                    <View style={[styles.petPhoto, styles.avatarPlaceholder]}>
                      <PawLogo size={28} accessibilityLabel={null} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petMeta}>
                      {[pet.species, pet.breed].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
                </Pressable>
              ))
            )}


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
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
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
  safeArea: { flex: 1, backgroundColor: COLORS.page },
  cover: { height: 120, backgroundColor: COLORS.primary },
  profileCard: { backgroundColor: COLORS.white, alignItems: 'center', padding: 18, marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: COLORS.white, marginTop: -66 },
  name: { fontSize: 26, color: COLORS.text, fontWeight: '800', marginTop: 8 },
  username: { color: COLORS.muted, marginTop: 2 },
  bio: { color: COLORS.text, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  stats: { flexDirection: 'row', marginTop: 18, width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: '800', fontSize: 18, color: COLORS.primary },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  sectionTitle: { marginHorizontal: 16, marginBottom: 10, color: COLORS.text, fontSize: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6 },
  gridImage: { width: '31.8%', aspectRatio: 1, borderRadius: 12, backgroundColor: COLORS.imagePlaceholder },
  accountCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 24, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountInfo: { flex: 1 },
  accountName: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  accountEmail: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, minWidth: 110, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 14, backgroundColor: COLORS.page },
  signOutPressed: { opacity: 0.7 },
  signOutText: { color: COLORS.primary, fontWeight: '700' },
  avatarPlaceholder: { backgroundColor: COLORS.page, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 10 },
  sectionTitleInline: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  addPetButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, minHeight: 36, borderRadius: 18 },
  addPetText: { color: COLORS.white, fontWeight: '700' },
  emptyText: { color: COLORS.muted, marginHorizontal: 16, marginBottom: 16 },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14 },
  petPhoto: { width: 48, height: 48, borderRadius: 24 },
  petName: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  petMeta: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
});
