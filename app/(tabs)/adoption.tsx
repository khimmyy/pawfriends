import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AdoptScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Find Your Companion</Text>
      <Text style={styles.subtitle}>Pets waiting for a forever home</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by breed, location..."
      />

      <View style={styles.categories}>
        {["All", "Dogs", "Cats", "Rabbits", "Birds"].map((item, index) => (
          <Text key={item} style={[styles.category, index === 0 && styles.activeCategory]}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>2,847{"\n"}Available</Text>
        <Text style={styles.stat}>312{"\n"}Adopted this month</Text>
        <Text style={styles.stat}>58{"\n"}Shelters</Text>
      </View>

      <Text style={styles.sectionTitle}>Near you</Text>

      <View style={styles.card}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01" }}
          style={styles.petImage}
        />

        <View style={styles.cardContent}>
          <Text style={styles.petName}>Buddy <Text style={styles.petInfo}>Male · 2 yrs</Text></Text>
          <Text style={styles.breed}>Labrador Mix</Text>
          <Text style={styles.location}>📍 San Francisco, CA · Bay Area Rescue</Text>

          <View style={styles.tags}>
            <Text style={styles.tag}>Vaccinated</Text>
            <Text style={styles.tag}>Neutered</Text>
            <Text style={styles.tag}>Good w/ kids</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Meet Buddy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: c.page, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: c.text, marginTop: 20 },
  subtitle: { fontSize: 14, color: c.muted, marginTop: 4 },
  search: {
    backgroundColor: c.surface,
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
    fontSize: 14,
  },
  categories: { flexDirection: "row", gap: 8, marginTop: 14 },
  category: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: c.surface,
    color: c.muted,
    fontWeight: "600",
  },
  activeCategory: { backgroundColor: c.primary, color: c.onPrimary },
  stats: {
    marginTop: 28,
    backgroundColor: c.primary,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: { color: c.onPrimary, fontWeight: "bold", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  card: {
    backgroundColor: c.surface,
    borderRadius: 18,
    marginTop: 14,
    overflow: "hidden",
  },
  petImage: { width: "100%", height: 220 },
  cardContent: { padding: 16 },
  petName: { fontSize: 20, fontWeight: "bold" },
  petInfo: { fontSize: 13, color: c.muted },
  breed: { color: c.muted, marginTop: 4 },
  location: { color: c.primary, marginTop: 10 },
  tags: { flexDirection: "row", gap: 8, marginTop: 12 },
  tag: {
    backgroundColor: c.primarySoft,
    color: c.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    fontWeight: "600",
  },
  buttons: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: {
    flex: 1,
    backgroundColor: c.primary,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: { color: c.onPrimary, fontWeight: "bold" },
  secondaryBtn: {
    backgroundColor: c.primarySoft,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryText: { color: c.text, fontWeight: "bold" },
});