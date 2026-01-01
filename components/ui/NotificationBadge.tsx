/**
 * NotificationBadge Component
 * 
 * Displays a count badge for unread notifications.
 * - Shows exact count for values 1-99
 * - Shows "99+" for counts exceeding 99
 * - Hidden when count is 0
 * 
 * Requirements: 1.2, 1.3, 1.5
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { fontFamily } from '../../theme/typography';
import { semanticColors } from '../../theme/colors';
import { formatBadgeCount, shouldShowBadge } from '../../utils/notificationBadgeUtils';
import { useTheme } from '../../hooks/useTheme';

// Re-export utility functions for convenience
export { formatBadgeCount, shouldShowBadge } from '../../utils/notificationBadgeUtils';

export interface NotificationBadgeProps extends ViewProps {
  /** Number of unread notifications */
  count: number;
  /** Maximum count to display before showing "+" suffix (default: 99) */
  maxCount?: number;
}

export function NotificationBadge({ 
  count, 
  maxCount = 99, 
  style, 
  ...props 
}: NotificationBadgeProps) {
  const { isDark } = useTheme();
  
  // Don't render if count is 0 or negative (Requirement 1.5)
  if (!shouldShowBadge(count)) {
    return null;
  }

  const displayText = formatBadgeCount(count, maxCount);

  return (
    <View
      style={[
        styles.container,
        // Use wider container for "99+" text
        count > maxCount && styles.containerWide,
        style,
      ]}
      {...props}
    >
      <Text style={styles.text}>
        {displayText}
      </Text>
    </View>
  );
}

const BADGE_FONT_SIZE = 10; // Smaller than xs (12px) for compact badge

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: semanticColors.error, // Red badge for notifications
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  containerWide: {
    minWidth: 28,
    paddingHorizontal: 6,
  },
  text: {
    color: '#ffffff',
    fontFamily: fontFamily.semibold,
    fontSize: BADGE_FONT_SIZE,
    lineHeight: BADGE_FONT_SIZE + 2,
    textAlign: 'center',
  },
});

export default NotificationBadge;
