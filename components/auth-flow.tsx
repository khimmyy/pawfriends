import { PawLogo } from '@/components/paw-logo';
import { BRAND_FONTS } from '@/constants/fonts';
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/constants/validation';
import { useAuth } from '@/context/auth';
import { COLORS } from '@/data/pets';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type Ref } from 'react';
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AuthMode = 'signIn' | 'register';

const CREAM = '#FFF8F0';
const TAGLINE = '#C7D7F8';
const ERROR = '#B91C1C';
const ERROR_BG = '#FEF2F2';
const INFO_BG = '#E6F1FB';

type FieldErrors = {
  fullName: string | null;
  email: string | null;
  password: string | null;
};

const NO_ERRORS: FieldErrors = { fullName: null, email: null, password: null };

const COPY = {
  signIn: { title: 'Welcome back', subtitle: 'Your pets missed you.', button: 'Sign in' },
  register: { title: 'Join the pack', subtitle: 'Create an account for you and your pets.', button: 'Create account' },
} as const;

/**
 * Sign in and create account on one screen, switched with a segmented control.
 * Both /login and /register render this; on success the protected routes in
 * app/_layout.tsx move the owner to the tabs.
 */
export function AuthFlow({ initialMode }: { initialMode: AuthMode }) {
  const { signIn, register } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isRegister = mode === 'register';
  const copy = COPY[mode];

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setErrors(NO_ERRORS);
    setFormError(null);
    setInfo(null);
  };

  const handleSubmit = async () => {
    const nextErrors: FieldErrors = {
      fullName: isRegister ? validateFullName(fullName) : null,
      email: validateEmail(email),
      password: isRegister ? validatePassword(password) : password ? null : 'Enter your password.',
    };
    setErrors(nextErrors);
    setFormError(null);
    setInfo(null);
    if (nextErrors.fullName || nextErrors.email || nextErrors.password) {
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ fullName, email, password });
      } else if (!(await signIn(email, password))) {
        setFormError('That email and password don’t match an account.');
      }
    } catch (error: unknown) {
      if (isRegister && error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        setErrors({ ...NO_ERRORS, email: 'An account with this email already exists.' });
      } else {
        setFormError(
          isRegister
            ? 'Unable to create your account right now. Please try again.'
            : 'Unable to sign in right now. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
            <View style={styles.logoTile}>
              <PawLogo size={52} accessibilityLabel={null} />
            </View>
            <Text style={styles.brand} accessibilityRole="header">
              PawFriends
            </Text>
            <Text style={styles.tagline}>Where pets make friends</Text>
          </View>

          <View style={[styles.card, { paddingBottom: insets.bottom + 20 }]}>
            <ModeSwitch mode={mode} onChange={switchMode} />

            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>

            {formError ? (
              <View style={[styles.message, styles.messageError]} accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle-outline" size={18} color={ERROR} />
                <Text style={[styles.messageText, { color: ERROR }]}>{formError}</Text>
              </View>
            ) : null}
            {info ? (
              <View style={[styles.message, styles.messageInfo]} accessibilityLiveRegion="polite">
                <Ionicons name="information-circle-outline" size={18} color={COLORS.blue} />
                <Text style={[styles.messageText, { color: COLORS.dark }]}>{info}</Text>
              </View>
            ) : null}

            {isRegister ? (
              <IconField
                label="Full name"
                icon="person-outline"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            ) : null}

            <IconField
              ref={emailRef}
              label="Email address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <IconField
              ref={passwordRef}
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              hint={isRegister ? `At least ${MIN_PASSWORD_LENGTH} characters` : null}
              revealable
              autoCapitalize="none"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              textContentType={isRegister ? 'newPassword' : 'password'}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            {isRegister ? null : (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setInfo(
                    'Your account is stored only on this device, so its password can’t be reset yet. If you can’t sign in, create a new account.'
                  )
                }
                hitSlop={8}
                style={styles.forgot}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.button}
              accessibilityState={{ disabled: submitting, busy: submitting }}
              disabled={submitting}
              onPress={handleSubmit}
              style={({ pressed }) => [styles.submit, (pressed || submitting) && styles.submitPressed]}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.submitText}>{copy.button}</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </Pressable>

            <View style={styles.footnote}>
              <Ionicons name="lock-closed-outline" size={13} color={COLORS.muted} />
              <Text style={styles.footnoteText}>Your account is stored only on this device</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type ModeSwitchProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  const options: { value: AuthMode; label: string }[] = [
    { value: 'signIn', label: 'Sign in' },
    { value: 'register', label: 'Create account' },
  ];
  return (
    <View style={styles.switch} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === mode;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.switchOption, selected && styles.switchOptionSelected]}
          >
            <Text style={[styles.switchText, selected && styles.switchTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type IconFieldProps = TextInputProps & {
  /** Read by screen readers and shown as the placeholder. */
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  /** Shown under the field when there is no error. */
  hint?: string | null;
  /** Hides the text, with an eye button to show it. */
  revealable?: boolean;
  ref?: Ref<TextInput>;
};

function IconField({ label, icon, error, hint, revealable = false, ref, onFocus, onBlur, ...inputProps }: IconFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.fieldBlock}>
      <View style={[styles.field, focused && styles.fieldFocused, error ? styles.fieldInvalid : null]}>
        <Ionicons name={icon} size={19} color={error ? ERROR : COLORS.blue} />
        <TextInput
          {...inputProps}
          ref={ref}
          accessibilityLabel={label}
          placeholder={label}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={revealable ? !revealed : inputProps.secureTextEntry}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={styles.input}
        />
        {revealable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            onPress={() => setRevealed(!revealed)}
            hitSlop={10}
            style={styles.reveal}
          >
            <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.fieldError}>{error}</Text>
      ) : hint ? (
        <Text style={styles.fieldHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.blue },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 60, gap: 6 },
  logoTile: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: { color: COLORS.white, fontSize: 34, fontFamily: BRAND_FONTS.bold },
  tagline: { color: TAGLINE, fontSize: 16, fontFamily: BRAND_FONTS.semiBold },
  card: {
    flexGrow: 1,
    marginTop: -32,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  switch: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 14, padding: 4, marginBottom: 22 },
  switchOption: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  switchOptionSelected: { backgroundColor: COLORS.white },
  switchText: { color: COLORS.muted, fontWeight: '600', fontSize: 14 },
  switchTextSelected: { color: COLORS.dark, fontWeight: '700' },
  title: { color: COLORS.dark, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 15, marginTop: 4, marginBottom: 18 },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, marginBottom: 14 },
  messageError: { backgroundColor: ERROR_BG },
  messageInfo: { backgroundColor: INFO_BG },
  messageText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  fieldBlock: { marginBottom: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
    backgroundColor: COLORS.bg,
  },
  fieldFocused: { borderColor: COLORS.blue, backgroundColor: COLORS.white },
  fieldInvalid: { borderColor: ERROR, backgroundColor: ERROR_BG },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: 15,
    color: COLORS.dark,
    ...(Platform.OS === 'web' ? { outlineWidth: 0 } : null),
  },
  reveal: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  fieldError: { color: ERROR, fontSize: 13, marginTop: 6, marginLeft: 4 },
  fieldHint: { color: COLORS.muted, fontSize: 13, marginTop: 6, marginLeft: 4 },
  forgot: { alignSelf: 'flex-end', paddingVertical: 4, marginTop: -4, marginBottom: 14 },
  forgotText: { color: COLORS.blue, fontWeight: '700', fontSize: 13 },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    marginTop: 6,
  },
  submitPressed: { opacity: 0.85 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 'auto', paddingTop: 24 },
  footnoteText: { color: COLORS.muted, fontSize: 12 },
});
