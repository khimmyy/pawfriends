import { PawLogo } from '@/components/paw-logo';
import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#FFF8F0',
  title: '#06123B',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#2257E5',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
  white: '#FFFFFF',
};

type AuthScreenProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

/** Shared page shell for the sign-in and registration screens. */
export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <View style={styles.logo}>
            <PawLogo size={84} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthField({ label, error, style, ...inputProps }: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={COLORS.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

/** A message for the whole form, such as a wrong password. */
export function FormError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.formErrorText}>{message}</Text>
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function AuthButton({ label, onPress, loading = false }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

type AuthSwitchLinkProps = {
  prompt: string;
  action: string;
  onPress: () => void;
};

export function AuthSwitchLink({ prompt, action, onPress }: AuthSwitchLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${prompt} ${action}`}
      onPress={onPress}
      style={styles.switchLink}
      hitSlop={8}
    >
      <Text style={styles.switchText}>
        {prompt} <Text style={styles.switchAction}>{action}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: COLORS.title,
  },
  subtitle: { fontSize: 16, textAlign: 'center', color: COLORS.muted, marginBottom: 30 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.title, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.title,
  },
  inputError: { borderColor: COLORS.error },
  fieldError: { color: COLORS.error, fontSize: 13, marginTop: 6 },
  formError: {
    backgroundColor: COLORS.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  formErrorText: { color: COLORS.error, fontWeight: '600', textAlign: 'center' },
  button: {
    backgroundColor: COLORS.primary,
    minHeight: 52,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  switchLink: { marginTop: 20, alignSelf: 'center', paddingVertical: 8 },
  switchText: { textAlign: 'center', color: COLORS.muted },
  switchAction: { color: COLORS.primary, fontWeight: '600' },
});
