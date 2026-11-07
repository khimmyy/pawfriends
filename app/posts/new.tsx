import { AuthButton, AuthField, FormError } from '@/components/auth-form';
import { useAuth } from '@/context/auth';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import { addPost, getPetsForOwner, type Pet } from '@/database/database';
import { goBackOr } from '@/utils/navigation';
import { pickPhoto, savePhoto } from '@/utils/pet-photos';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_CAPTION_LENGTH = 500;

function leavePostScreen() {
  goBackOr('/(tabs)/home');
}

export default function NewPostScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const db = useSQLiteContext();
  const { owner } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!owner) {
      return;
    }
    let active = true;
    getPetsForOwner(db, owner.id)
      .then((result) => {
        if (!active) return;
        setPets(result);
        // Tag the first pet by default; the owner can switch or pick "No pet".
        setPetId((current) => current ?? result[0]?.id ?? null);
      })
      .catch(() => {
        if (active) setFormError('Could not load your pets.');
      });
    return () => {
      active = false;
    };
  }, [db, owner]);

  if (!owner) {
    return null;
  }

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

  const handlePost = async () => {
    const trimmedCaption = caption.trim();
    const nextCaptionError = trimmedCaption ? null : 'Write something about your post.';
    setCaptionError(nextCaptionError);
    setFormError(null);
    if (nextCaptionError) {
      return;
    }

    setPosting(true);
    try {
      const savedPhotoUri = photoUri ? await savePhoto(photoUri, 'post-photos') : null;
      await addPost(db, owner.id, { petId, caption: trimmedCaption, photoUri: savedPhotoUri });
      leavePostScreen();
    } catch {
      setFormError('Could not share your post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={leavePostScreen}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">
          Create a post
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormError message={formError} />

        <Text style={styles.label}>Posting about</Text>
        {pets.length > 0 ? (
          <View style={styles.chipRow}>
            {pets.map((pet) => (
              <PetChip
                key={pet.id}
                label={pet.name}
                selected={pet.id === petId}
                onPress={() => setPetId(pet.id)}
              />
            ))}
            <PetChip label="No pet" selected={petId === null} onPress={() => setPetId(null)} />
          </View>
        ) : (
          <Text style={styles.hint}>Add a pet on your Profile to tag them in posts.</Text>
        )}

        <AuthField
          label="What's your pet up to today?"
          placeholder="Share a moment, a milestone, or a funny story"
          value={caption}
          onChangeText={setCaption}
          error={captionError}
          multiline
          maxLength={MAX_CAPTION_LENGTH}
          style={styles.captionInput}
        />
        <Text style={styles.counter}>
          {caption.length}/{MAX_CAPTION_LENGTH}
        </Text>

        {photoUri ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Selected photo" />
            <View style={styles.photoActions}>
              <Pressable accessibilityRole="button" onPress={choosePhoto} hitSlop={8}>
                <Text style={styles.photoLink}>Change photo</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setPhotoUri(null)} hitSlop={8}>
                <Text style={styles.photoRemove}>Remove photo</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
            onPress={choosePhoto}
            style={styles.addPhoto}
          >
            <Ionicons name="image-outline" size={22} color={colors.primary} />
            <Text style={styles.photoLink}>Add a photo</Text>
          </Pressable>
        )}

        <AuthButton label="Share post" onPress={handlePost} loading={posting} />
      </ScrollView>
    </SafeAreaView>
  );
}

type PetChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function PetChip({ label, selected, onPress }: PetChipProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.page },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: c.text },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
  hint: { color: c.muted, marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  chipSelected: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.muted, fontWeight: '600' },
  chipTextSelected: { color: c.onPrimary },
  captionInput: { minHeight: 120, textAlignVertical: 'top' },
  counter: { alignSelf: 'flex-end', color: c.muted, fontSize: 12, marginTop: -8, marginBottom: 14 },
  addPhoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: c.primary, backgroundColor: c.surface, marginBottom: 8 },
  photoPreview: { marginBottom: 8 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: c.imagePlaceholder },
  photoActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  photoLink: { color: c.primary, fontWeight: '700' },
  photoRemove: { color: c.danger, fontWeight: '700' },
});
