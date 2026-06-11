import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AdoptScreen() {
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FF", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#06123B", marginTop: 20 },
  subtitle: { fontSize: 14, color: "#54608A", marginTop: 4 },
  search: {
    backgroundColor: "#EAF0FF",
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
    backgroundColor: "#fff",
    color: "#536093",
    fontWeight: "600",
  },
  activeCategory: { backgroundColor: "#2257E5", color: "#fff" },
  stats: {
    marginTop: 28,
    backgroundColor: "#2257E5",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginTop: 14,
    overflow: "hidden",
  },
  petImage: { width: "100%", height: 220 },
  cardContent: { padding: 16 },
  petName: { fontSize: 20, fontWeight: "bold" },
  petInfo: { fontSize: 13, color: "#536093" },
  breed: { color: "#536093", marginTop: 4 },
  location: { color: "#2257E5", marginTop: 10 },
  tags: { flexDirection: "row", gap: 8, marginTop: 12 },
  tag: {
    backgroundColor: "#EEF3FF",
    color: "#2257E5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    fontWeight: "600",
  },
  buttons: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2257E5",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "bold" },
  secondaryBtn: {
    backgroundColor: "#EEF3FF",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryText: { color: "#06123B", fontWeight: "bold" },
});