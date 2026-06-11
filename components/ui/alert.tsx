import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewProps } from 'react-native';

type AlertVariant = 'default' | 'destructive' | 'success';

type AlertProps = ViewProps & {
  icon?: ReactNode;
  variant?: AlertVariant;
};

type AlertTextProps = TextProps & {
  style?: StyleProp<TextStyle>;
};

export function Alert({ children, icon, style, variant = 'default', ...props }: AlertProps) {
  const tone = alertTones[variant];

  return (
    <View style={[styles.root, { backgroundColor: tone.background, borderColor: tone.border }, style]} {...props}>
      <View style={styles.icon}>
        {icon ?? <Ionicons color={tone.icon} name={variant === 'destructive' ? 'warning-outline' : 'alert-circle-outline'} size={20} />}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function AlertTitle({ style, ...props }: AlertTextProps) {
  return <Text style={[styles.title, style]} {...props} />;
}

export function AlertDescription({ style, ...props }: AlertTextProps) {
  return <Text style={[styles.description, style]} {...props} />;
}

const alertTones: Record<AlertVariant, { background: string; border: string; icon: string }> = {
  default: {
    background: '#FFFFFF',
    border: '#D7DEE8',
    icon: '#2563EB',
  },
  destructive: {
    background: '#FEF2F2',
    border: '#FECACA',
    icon: '#DC2626',
  },
  success: {
    background: '#F0FDF4',
    border: '#BBF7D0',
    icon: '#16A34A',
  },
};

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  icon: {
    paddingTop: 1,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
