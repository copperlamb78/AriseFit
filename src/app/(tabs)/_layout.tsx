import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, spacing, typography } from '../../theme/tokens';

interface TabHudIconProps {
  code: string;
  focused: boolean;
}

function TabHudIcon({ code, focused }: TabHudIconProps) {
  return (
    <View style={[styles.iconBox, focused ? styles.iconBoxFocused : null]}>
      <Text style={[styles.iconText, focused ? styles.iconTextFocused : null]}>
        {code}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentCyan,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sistema',
          tabBarIcon: ({ focused }) => <TabHudIcon code="SYS" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="daily-quest"
        options={{
          title: 'Missão',
          tabBarIcon: ({ focused }) => <TabHudIcon code="QST" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progression"
        options={{
          title: 'Evolução',
          tabBarIcon: ({ focused }) => <TabHudIcon code="ATR" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Caçador',
          tabBarIcon: ({ focused }) => <TabHudIcon code="HUN" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => <TabHudIcon code="LOG" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: borders.thin,
    borderTopColor: colors.borderSubtle,
    height: 68,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  iconBox: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  iconBoxFocused: {
    borderColor: colors.accentCyan,
    backgroundColor: colors.cyanGlowBg,
  },
  iconText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.heavy,
  },
  iconTextFocused: {
    color: colors.accentCyan,
  },
});
