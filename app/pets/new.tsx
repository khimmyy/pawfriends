import { PetForm } from '@/components/pet-form';
import { useAuth } from '@/context/auth';
import { addPet, type PetInput } from '@/database/database';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function NewPetScreen() {
  const db = useSQLiteContext();
  const { owner } = useAuth();

  if (!owner) {
    return null;
  }

  const handleSubmit = async (input: PetInput) => {
    await addPet(db, owner.id, input);
    router.back();
  };

  return <PetForm title="Add a pet" submitLabel="Add pet" onSubmit={handleSubmit} />;
}