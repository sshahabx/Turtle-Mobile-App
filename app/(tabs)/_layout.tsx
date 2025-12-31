/**
 * Tab Layout
 * 
 * Main tab navigation layout for the app.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font to tab labels
 * - 3.1: Use zinc-based color palette
 * - 3.1, 3.2, 3.3, 3.4: Tab bar alignment and safe area handling
 */

import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { fontFamily, spacing, layoutSpacing } from "../../theme";

/**
 * Tab Icon Component
 */
function TabIcon({ name, focused, colors }: { name: string; focused: boolean; colors: { primary: string; textTertiary: string } }) {
  const color = focused ? colors.primary : colors.textTertiary;

  if (name === "dashboard") {
    return (
      <View style={styles.iconContainer}>
        <View style={styles.dashboardIcon}>
          <View style={[styles.dashboardSquare, { backgroundColor: color }]} />
          <View style={[styles.dashboardSquare, { backgroundColor: color }]} />
          <View style={[styles.dashboardSquare, { backgroundColor: color }]} />
          <View style={[styles.dashboardSquare, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === "notes") {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.noteLine, { backgroundColor: color, width: 20 }]} />
        <View style={[styles.noteLine, { backgroundColor: color, width: 14 }]} />
        <View style={[styles.noteLine, { backgroundColor: color, width: 20 }]} />
      </View>
    );
  }

  if (name === "tasks") {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.taskBox, { borderColor: color }]}>
          <View style={[styles.taskCheck, { borderColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === "habits") {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.habitCircle, { borderColor: color }]}>
          <View style={[styles.habitDot, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === "profile") {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.profileHead, { backgroundColor: color }]} />
        <View style={[styles.profileBody, { backgroundColor: color }]} />
      </View>
    );
  }

  return null;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate proper bottom padding based on safe area
  // Minimum padding of 8px, plus safe area inset for devices with home indicator
  const bottomPadding = Math.max(spacing.sm, insets.bottom) + spacing.sm;
  
  // Tab bar content height (icon + label + spacing)
  const tabBarContentHeight = layoutSpacing.tabBarHeight;
  
  // Total tab bar height including safe area
  const tabBarHeight = tabBarContentHeight + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: spacing.sm,
          // Ensure icons and labels are centered
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          // Center content within each tab item
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.xs,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
          marginTop: spacing.xs,
          // Ensure consistent label positioning
          textAlign: 'center',
        },
        tabBarIconStyle: {
          // Center icons within their container
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ focused }) => <TabIcon name="notes" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => <TabIcon name="tasks" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ focused }) => <TabIcon name="habits" focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} colors={colors} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardIcon: {
    width: 22,
    height: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  dashboardSquare: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  noteLine: {
    height: 2,
    borderRadius: 1,
    marginVertical: 2,
  },
  taskBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCheck: {
    width: 8,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "-45deg" }],
    marginTop: -2,
  },
  habitCircle: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  habitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  profileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  profileBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
