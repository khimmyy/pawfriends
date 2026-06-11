import { createContext, PropsWithChildren, ReactNode, useContext, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ButtonProps } from './button';

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type AlertDialogProps = PropsWithChildren<{
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}>;

type AlertDialogTriggerProps = PressableProps & {
  children: ReactNode;
};

type AlertDialogActionProps = Omit<ButtonProps, 'children'> & {
  children: ReactNode;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error('AlertDialog components must be used inside <AlertDialog>.');
  }

  return context;
}

export function AlertDialog({ children, defaultOpen = false, onOpenChange, open }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : internalOpen;

  const value = useMemo(
    () => ({
      open: visible,
      setOpen: (nextOpen: boolean) => {
        if (!isControlled) {
          setInternalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
      },
    }),
    [isControlled, onOpenChange, visible],
  );

  return <AlertDialogContext.Provider value={value}>{children}</AlertDialogContext.Provider>;
}

export function AlertDialogTrigger({ children, onPress, style, ...props }: AlertDialogTriggerProps) {
  const { setOpen } = useAlertDialog();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={(event) => {
        onPress?.(event);
        setOpen(true);
      }}
      style={style}
      {...props}>
      {children}
    </Pressable>
  );
}

export function AlertDialogPortal({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function AlertDialogOverlay({ style, ...props }: ViewProps) {
  return <View style={[styles.overlay, style]} {...props} />;
}

export function AlertDialogContent({ children, style, ...props }: ViewProps) {
  const { open, setOpen } = useAlertDialog();
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
      <View style={[styles.modalRoot, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Pressable accessibilityLabel="Close dialog" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill}>
          <AlertDialogOverlay />
        </Pressable>
        <View style={[styles.content, style]} {...props}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function AlertDialogHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.header, style]} {...props} />;
}

export function AlertDialogFooter({ style, ...props }: ViewProps) {
  return <View style={[styles.footer, style]} {...props} />;
}

export function AlertDialogTitle({ style, ...props }: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text accessibilityRole="header" style={[styles.title, style]} {...props} />;
}

export function AlertDialogDescription({ style, ...props }: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.description, style]} {...props} />;
}

export function AlertDialogAction({ children, onPress, variant = 'default', ...props }: AlertDialogActionProps) {
  const { setOpen } = useAlertDialog();

  return (
    <Button
      onPress={(event) => {
        onPress?.(event);
        setOpen(false);
      }}
      variant={variant}
      {...props}>
      {children}
    </Button>
  );
}

export function AlertDialogCancel({ children, onPress, variant = 'outline', ...props }: AlertDialogActionProps) {
  const { setOpen } = useAlertDialog();

  return (
    <Button
      onPress={(event) => {
        onPress?.(event);
        setOpen(false);
      }}
      variant={variant}
      {...props}>
      {children}
    </Button>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    flex: 1,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 18,
    maxWidth: 420,
    padding: 20,
    shadowColor: '#020617',
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    width: '100%',
  },
  header: {
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
