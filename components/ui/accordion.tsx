import { PropsWithChildren, ReactNode, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AccordionProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

type AccordionItemProps = PropsWithChildren<{
  title: ReactNode;
  defaultOpen?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Accordion({ children, style }: AccordionProps) {
  return <View style={[styles.root, style]}>{children}</View>;
}

export function AccordionItem({ children, defaultOpen = false, style, title }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useColorScheme() ?? 'light';
  const iconColor = theme === 'light' ? Colors.light.icon : Colors.dark.icon;

  return (
    <View style={[styles.item, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((value) => !value)}
        style={styles.trigger}>
        <View style={styles.title}>
          {typeof title === 'string' ? <ThemedText type="defaultSemiBold">{title}</ThemedText> : title}
        </View>
        <IconSymbol
          color={iconColor}
          name="chevron.right"
          size={18}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          weight="medium"
        />
      </Pressable>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  item: {
    gap: 8,
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  content: {
    paddingTop: 2,
  },
});
