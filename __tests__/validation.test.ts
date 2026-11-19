import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/constants/validation';

describe('validateFullName', () => {
  it('accepts a name', () => {
    expect(validateFullName('Khim')).toBeNull();
  });

  it.each(['', '   '])('rejects %p', (value) => {
    expect(validateFullName(value)).toBe('Enter your full name.');
  });
});

describe('validateEmail', () => {
  it.each(['name@example.com', '  name@example.com  ', 'first.last@mail.up.edu.ph'])('accepts %p', (value) => {
    expect(validateEmail(value)).toBeNull();
  });

  it('asks for an email when empty', () => {
    expect(validateEmail('  ')).toBe('Enter your email address.');
  });

  it.each(['not-an-email', 'name@', '@example.com', 'name@example', 'na me@example.com'])(
    'rejects %p',
    (value) => {
      expect(validateEmail(value)).toBe('Enter a valid email address, like name@example.com.');
    }
  );
});

describe('validatePassword', () => {
  it('asks for a password when empty', () => {
    expect(validatePassword('')).toBe('Enter a password.');
  });

  it('rejects a password one character too short', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  });

  it('accepts a password of the minimum length', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });
});
