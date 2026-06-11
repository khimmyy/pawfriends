import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export type ButtonProps = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  size?: ButtonSize;
  textStyle?: StyleProp<TextStyle>;
  variant?: ButtonVariant;
};

export function buttonVariants({
  size = 'default',
  variant = 'default',
}: {
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return [styles.base, variantStyles[variant], sizeStyles[size]];
}

export function buttonTextVariants({
  variant = 'default',
}: {
  variant?: ButtonVariant;
} = {}) {
  return [styles.text, textVariantStyles[variant]];
}

export function Button({
  children,
  disabled,
  loading = false,
  size = 'default',
  style,
  textStyle,
  variant = 'default',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        buttonVariants({ size, variant }),
        state.pressed && !isDisabled ? styles.pressed : undefined,
        isDisabled ? styles.disabled : undefined,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0F172A' : '#FFFFFF'} />
      ) : typeof children === 'string' ? (
        <Text style={[buttonTextVariants({ variant }), textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create<Record<ButtonVariant, ViewStyle>>({
  default: {
    backgroundColor: '#0F172A',
  },
  destructive: {
    backgroundColor: '#DC2626',
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7DEE8',
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: '#E8EEF7',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
});

const textVariantStyles = StyleSheet.create<Record<ButtonVariant, TextStyle>>({
  default: {
    color: '#FFFFFF',
  },
  destructive: {
    color: '#FFFFFF',
  },
  outline: {
    color: '#0F172A',
  },
  secondary: {
    color: '#0F172A',
  },
  ghost: {
    color: '#0F172A',
  },
  link: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});

const sizeStyles = StyleSheet.create<Record<ButtonSize, ViewStyle>>({
  default: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lg: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  icon: {
    height: 40,
    paddingHorizontal: 0,
    width: 40,
  },
});
