/**
 * NotificationIcon Component
 * 
 * A bell icon with an integrated notification badge that displays unread count.
 * Handles press events to open the notification center.
 * 
 * Requirements: 1.1, 1.4
 * - 1.1: Display notification icon adjacent to search icon in dashboard header
 * - 1.4: When tapped, open the notification center modal
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { NotificationBadge } from './NotificationBadge';

export interface NotificationIconProps {
  /** Number of unread notifications to display in badge */
  unreadCount: number;
  /** Callback when the icon is pressed */
  onPress: () => void;
  /** Optional size of the icon (default: 22) */
  size?: number;
  /** Optional custom style for the container */
  style?: ViewStyle;
}

/**
 * NotificationIcon displays a bell icon with an optional badge showing unread count.
 * 
 * @example
 * ```tsx
 * <NotificationIcon
 *   unreadCount={5}
 *   onPress={() => router.push('/modals/notifications')}
 * />
 * ```
 */
export function NotificationIcon({
  unreadCount,
  onPress,
  size = 22,
  style,
}: NotificationIconProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
        style,
      ]}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      accessibilityRole="button"
    >
      <Ionicons
        name="notifications-outline"
        size={size}
        color={colors.textSecondary}
      />
      <NotificationBadge count={unreadCount} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationIcon;
