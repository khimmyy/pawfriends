export const MIN_PASSWORD_LENGTH = 8;

// Deliberately simple: something@something.something with no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message, or null when the value is valid. */
export function validateFullName(fullName: string) {
  return fullName.trim() ? null : 'Enter your full name.';
}

export function validateEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Enter your email address.';
  }
  return EMAIL_PATTERN.test(trimmed) ? null : 'Enter a valid email address, like name@example.com.';
}

export function validatePassword(password: string) {
  if (!password) {
    return 'Enter a password.';
  }
  return password.length >= MIN_PASSWORD_LENGTH
    ? null
    : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
}
