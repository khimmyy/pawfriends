import { leavePetScreen, PetForm } from '@/components/pet-form';
import { useAuth } from '@/context/auth';
import { addPet, type PetInput } from '@/database/database';
import { useSQLiteContext } from 'expo-sqlite';

export default function NewPetScreen() {
  const db = useSQLiteContext();
  const { owner } = useAuth();

  if (!owner) {
    return null;
  }

  const handleSubmit = async (input: PetInput) => {
    await addPet(db, owner.id, input);
    leavePetScreen();
  };

  return <PetForm title="Add a pet" submitLabel="Add pet" onSubmit={handleSubmit} />;
}