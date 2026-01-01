/**
 * Notification Center Modal Screen
 * 
 * Displays a scrollable list of notifications sorted by timestamp (newest first).
 * Supports swipe-to-delete, mark as read, and clear all actions.
 * 
 * Requirements:
 * - 2.1: Display scrollable list of notifications sorted by timestamp (newest first)
 * - 2.2: Show unread indicator for unread notifications
 * - 2.3: Mark notification as read and navigate to relevant screen on tap
 * - 2.4: Provide "Mark all as read" action
 * - 2.5: Provide "Clear all" action to delete all notifications
 * - 2.6: Display empty state when no notifications
 * - 2.7: Swipe left to reveal delete action
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../hooks/useTheme';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification, NotificationType } from '../../types/notifications';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85; // 85% of screen height for notification center

/**
 * Get icon name based on notification type
 */
function getNotificationIcon(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case NotificationType.JOB_STATUS_CHANGE:
      return 'briefcase-outline';
    case NotificationType.HABIT_REMINDER:
      return 'repeat-outline';
    case NotificationType.TASK_DUE:
      return 'time-outline';
    case NotificationType.TASK_OVERDUE:
      return 'alert-circle-outline';
    case NotificationType.GOAL_ACHIEVEMENT:
      return 'trophy-outline';
    case NotificationType.DAILY_SUMMARY:
      return 'stats-chart-outline';
    default:
      return 'notifications-outline';
  }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
}

export default function NotificationsModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  // Sort notifications by timestamp (newest first) - Requirement 2.1
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClose = () => {
    router.back();
  };

  // Handle notification tap - mark as read and navigate (Requirement 2.3)
  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      // Mark as read
      markAsRead(notification.id);

      // Navigate to relevant screen based on notification data
      if (notification.data?.targetType && notification.data?.targetId) {
        const { targetType, targetId } = notification.data;
        router.back(); // Close modal first
        
        // Navigate to the appropriate screen
        setTimeout(() => {
          switch (targetType) {
            case 'job':
              router.push(`/job/${targetId}`);
              break;
            case 'habit':
              router.push(`/habit/${targetId}`);
              break;
            case 'task':
              router.push(`/task/${targetId}`);
              break;
            case 'note':
              router.push(`/note/${targetId}`);
              break;
          }
        }, 100);
      }
    },
    [markAsRead, router]
  );

  // Handle mark all as read (Requirement 2.4)
  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Handle clear all notifications (Requirement 2.5)
  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAllNotifications(),
        },
      ]
    );
  }, [clearAllNotifications]);

  // Handle delete single notification (Requirement 2.7)
  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification(id);
    },
    [deleteNotification]
  );

  // Render swipe-to-delete action (Requirement 2.7)
  const renderRightActions = useCallback(
    (id: string) => {
      return (
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: colors.error }]}
          onPress={() => handleDelete(id)}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      );
    },
    [colors.error, handleDelete]
  );

  // Render notification item
  const renderNotificationItem = useCallback(
    ({ item }: { item: Notification }) => {
      const icon = getNotificationIcon(item.type);
      const timestamp = item.timestamp instanceof Date 
        ? item.timestamp 
        : new Date(item.timestamp);

      return (
        <Swipeable
          renderRightActions={() => renderRightActions(item.id)}
          overshootRight={false}
        >
          <TouchableOpacity
            style={[
              styles.notificationItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              !item.read && { backgroundColor: colors.backgroundSecondary },
            ]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
          >
            {/* Unread indicator (Requirement 2.2) */}
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
            
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
              <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            
            <View style={styles.contentContainer}>
              <Text
                style={[
                  styles.notificationTitle,
                  { color: colors.text },
                  !item.read && { fontFamily: fontFamily.semibold },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.notificationBody, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.body}
              </Text>
              <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                {formatTimestamp(timestamp)}
              </Text>
            </View>
            
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textTertiary}
              style={styles.chevron}
            />
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [colors, handleNotificationPress, renderRightActions]
  );

  // Empty state component (Requirement 2.6)
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="notifications-off-outline" size={48} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, height: MODAL_HEIGHT },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          
          {/* Header actions */}
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.headerAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.headerActionText, { color: colors.primary }]}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.headerAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.headerActionText, { color: colors.error }]}>
                  Clear all
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification list */}
        <FlatList
          data={sortedNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerActionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginLeft: spacing.sm,
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    marginBottom: 2,
  },
  notificationBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  deleteAction: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
