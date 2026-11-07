import { AuthButton, AuthField, FormError } from '@/components/auth-form';
import { COLORS } from '@/constants/colors';
import { PET_SPECIES, type PetInput, type PetSpecies } from '@/database/database';
import { goBackOr } from '@/utils/navigation';
import { pickPhoto, savePetPhoto } from '@/utils/pet-photos';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BIRTHDAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Leaves a pet screen, going to Profile when there is no previous screen. */
export function leavePetScreen() {
  goBackOr('/(tabs)/profile');
}

type PetFormProps = {
  title: string;
  submitLabel: string;
  initial?: PetInput;
  onSubmit: (input: PetInput) => Promise<void>;
};

export function PetForm({ title, submitLabel, initial, onSubmit }: PetFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [species, setSpecies] = useState<PetSpecies>(initial?.species ?? 'Dog');
  const [breed, setBreed] = useState(initial?.breed ?? '');
  const [birthday, setBirthday] = useState(initial?.birthday ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(initial?.photoUri ?? null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [birthdayError, setBirthdayError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const choosePhoto = async () => {
    try {
      const picked = await pickPhoto();
      if (picked) {
        setPhotoUri(picked);
      }
    } catch {
      setFormError('Could not open your photos.');
    }
  };

  const handleSubmit = async () => {
    const nextNameError = name.trim() ? null : "Enter your pet's name.";
    const nextBirthdayError =
      !birthday.trim() || BIRTHDAY_PATTERN.test(birthday.trim())
        ? null
        : 'Use the format YYYY-MM-DD, like 2022-05-14.';
    setNameError(nextNameError);
    setBirthdayError(nextBirthdayError);
    setFormError(null);
    if (nextNameError || nextBirthdayError) {
      return;
    }

    setSaving(true);
    try {
      // Only copy the photo into app storage when a new one was picked.
      const savedPhotoUri =
        photoUri && photoUri !== initial?.photoUri ? await savePetPhoto(photoUri) : photoUri;

      await onSubmit({
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        birthday: birthday.trim() || null,
        photoUri: savedPhotoUri,
      });
    } catch {
      setFormError('Could not save your pet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={leavePetScreen}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormError message={formError} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={photoUri ? 'Change photo' : 'Add a photo'}
          onPress={choosePhoto}
          style={styles.photoPicker}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.photoText}>{photoUri ? 'Change photo' : 'Add a photo'}</Text>
        </Pressable>

        <AuthField label="Name" placeholder="e.g. Mochi" value={name} onChangeText={setName} error={nameError} />

        <Text style={styles.label}>Species</Text>
        <View style={styles.speciesRow}>
          {PET_SPECIES.map((option) => {
            const selected = option === species;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setSpecies(option)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <AuthField label="Breed (optional)" placeholder="e.g. Shih Tzu" value={breed} onChangeText={setBreed} />

        <AuthField
          label="Birthday (optional)"
          placeholder="YYYY-MM-DD"
          value={birthday}
          onChangeText={setBirthday}
          error={birthdayError}
          keyboardType="numbers-and-punctuation"
        />

        <AuthButton label={submitLabel} onPress={handleSubmit} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.page },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  content: { padding: 20 },
  photoPicker: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { backgroundColor: COLORS.white, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  photoText: { marginTop: 8, color: COLORS.primary, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  speciesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.muted, fontWeight: '600' },
  chipTextSelected: { color: COLORS.white },
});