import { PetForm } from '@/components/pet-form';
import { useAuth } from '@/context/auth';
import { COLORS } from '@/data/pets';
import { getPet, updatePet, type Pet, type PetInput } from '@/database/database';
import { deletePetPhoto } from '@/utils/pet-photos';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { owner } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!owner) {
      return;
    }
    let active = true;
    getPet(db, owner.id, Number(id))
      .then((found) => {
        if (active) setPet(found);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [db, owner, id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.blue} />
      </View>
    );
  }

  if (!pet || !owner) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>We could not find that pet.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSubmit = async (input: PetInput) => {
    await updatePet(db, owner.id, pet.id, input);
    // Remove the old photo file if it was replaced or removed.
    if (pet.photoUri && pet.photoUri !== input.photoUri) {
      deletePetPhoto(pet.photoUri);
    }
    router.back();
  };

  return <PetForm title={`Edit ${pet.name}`} submitLabel="Save changes" initial={pet} onSubmit={handleSubmit} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: COLORS.bg },
  message: { color: COLORS.dark, fontSize: 16 },
  link: { color: COLORS.blue, fontWeight: '700' },
});