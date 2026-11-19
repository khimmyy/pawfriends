import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

// Form pieces shared by the pet and post forms. The sign-in screen has its own, in auth-flow.tsx.

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthField({ label, error, style, ...inputProps }: AuthFieldProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

/** A message for the whole form, such as a failed save. */
export function FormError({ message }: { message: string | null }) {
  const colors = useColors();
  const styles = createStyles(colors);
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
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]}
    >
      {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
  input: {
    backgroundColor: c.surface,
    padding: 16,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: c.border,
    color: c.text,
  },
  inputError: { borderColor: c.danger },
  fieldError: { color: c.danger, fontSize: 13, marginTop: 6 },
  formError: {
    backgroundColor: c.dangerSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  formErrorText: { color: c.danger, fontWeight: '600', textAlign: 'center' },
  button: {
    backgroundColor: c.primary,
    minHeight: 52,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: c.onPrimary, fontWeight: 'bold', fontSize: 16 },
});
