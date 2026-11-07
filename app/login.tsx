import { AuthButton, AuthField, AuthScreen, AuthSwitchLink, FormError } from '@/components/auth-form';
import { validateEmail } from '@/constants/validation';
import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = password ? null : 'Enter your password.';
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) {
      return;
    }

    setSubmitting(true);
    try {
      const signedIn = await signIn(email, password);
      if (!signedIn) {
        setFormError('That email and password don’t match an account.');
      }
      // On success the protected routes in app/_layout.tsx switch to the tabs.
    } catch {
      setFormError('Unable to sign in right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to your PawFriends account">
      <FormError message={formError} />

      <AuthField
        label="Email address"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        returnKeyType="next"
      />

      <AuthField
        label="Password"
        placeholder="Your password"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
      />

      <AuthButton label="Sign in" onPress={handleSignIn} loading={submitting} />

      <AuthSwitchLink
        prompt="New to PawFriends?"
        action="Create an account"
        onPress={() => router.replace('/register')}
      />
    </AuthScreen>
  );
}
