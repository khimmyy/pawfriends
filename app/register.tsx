import { AuthButton, AuthField, AuthScreen, AuthSwitchLink, FormError } from '@/components/auth-form';
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/constants/validation';
import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';

type FieldErrors = {
  fullName: string | null;
  email: string | null;
  password: string | null;
};

const NO_ERRORS: FieldErrors = { fullName: null, email: null, password: null };

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.fullName || nextErrors.email || nextErrors.password) {
      return;
    }

    setSubmitting(true);
    try {
      await register({ fullName, email, password });
      // On success the protected routes in app/_layout.tsx switch to the tabs.
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        setErrors({ ...NO_ERRORS, email: 'An account with this email already exists.' });
      } else {
        setFormError('Unable to create your account right now. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen title="Welcome to PawFriends" subtitle="Create your owner account">
      <FormError message={formError} />

      <AuthField
        label="Full name"
        placeholder="Your name"
        autoComplete="name"
        textContentType="name"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
        returnKeyType="next"
      />

      <AuthField
        label="Email address"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        returnKeyType="next"
      />

      <AuthField
        label="Password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        returnKeyType="go"
        onSubmitEditing={handleRegister}
      />

      <AuthButton label="Create account" onPress={handleRegister} loading={submitting} />

      <AuthSwitchLink
        prompt="Already have an account?"
        action="Sign in"
        onPress={() => router.replace('/login')}
      />
    </AuthScreen>
  );
}
