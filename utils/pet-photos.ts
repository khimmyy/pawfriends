import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/** Opens the photo library. Returns the picked image's temporary URI, or null if cancelled. */
export async function pickPetPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled) {
    return null;
  }
  return result.assets[0].uri;
}

/** Copies a picked image into the app's own folder and returns the permanent URI. */
export async function savePetPhoto(pickedUri: string): Promise<string> {
  // expo-file-system does not support web, so keep the picker's URI there.
  if (Platform.OS === 'web') {
    return pickedUri;
  }

  const folder = new Directory(Paths.document, 'pet-photos');
  folder.create({ idempotent: true, intermediates: true });

  const extension = pickedUri.split('?')[0].split('.').pop() || 'jpg';
  const destination = new File(folder, `${Date.now()}.${extension}`);
  await new File(pickedUri).copy(destination);
  return destination.uri;
}

/** Deletes a saved photo, for example after it is replaced. */
export function deletePetPhoto(uri: string | null) {
  if (!uri || Platform.OS === 'web') {
    return;
  }
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}