import { useColors } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

export default function TabLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderRadius: 25,
          marginLeft:10,
          marginRight: 10,
          marginBottom: 10,
          borderColor: colors.primary,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'PawFeed',
          tabBarIcon: ({ color, size }) => <TabIcon name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="adoption"
        options={{
          title: 'Adopt',
          tabBarIcon: ({ color, size }) => <TabIcon name="paw" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="veterinary"
        options={{
          title: 'Vet',
          tabBarIcon: ({ color, size }) => <TabIcon name="medical" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          tabBarBadge: 4,
          tabBarBadgeStyle: { backgroundColor: colors.heart, color: colors.onPrimary },
          tabBarIcon: ({ color, size }) => <TabIcon name="notifications" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue | null | undefined;
  size: number;
};

// Since React Native 0.88 the tab bar passes the wider ColorValue type (it can be a number or null),
// while @expo/vector-icons still expects a string. The tint colors set above are always strings.
function TabIcon({ name, color, size }: TabIconProps) {
  return <Ionicons name={name} size={size} color={typeof color === 'string' ? color : undefined} />;
}
