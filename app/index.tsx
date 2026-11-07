import { useAuth } from '@/context/auth';
import { Redirect } from 'expo-router';

export default function Index() {
  const { owner } = useAuth();
  return <Redirect href={owner ? '/(tabs)/home' : '/login'} />;
}
