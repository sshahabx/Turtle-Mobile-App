/**
 * Task Detail Screen
 * 
 * Displays as a bottom sheet taking 70% of screen height.
 * Supports swipe-to-close gesture on the handle area.
 */

import React, { useRef } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet, Dimensions, Pressable, PanResponder, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTask, useTasks } from '../../features/tasks/hooks/useTasks';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/date';
import { fontFamily, fontSize, spacing } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = 100;

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { task, isLoading, error } = useTask(id);
  const { deleteTask, toggleTask, isDeleting, isToggling } = useTasks();
  const { success, error: hapticError } = useHaptics();
  const { colors, isDark } = useTheme();

  // Swipe-to-close animation
  const translateY = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: MODAL_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => router.back());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    router.back();
  };

  const handleToggle = async () => {
    if (!id) return;
    try {
      await toggleTask(id);
      await success();
    } catch (err) {
      console.error('Toggle task error:', err);
      await hapticError();
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/modals/edit-task', params: { id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(id!);
            await success();
            router.back();
          } catch (err) {
            await hapticError();
            Alert.alert('Error', 'Failed to delete task.');
          }
        },
      },
    ]);
  };

  // Show loading state when fetching OR when data hasn't arrived yet (no error)
  if (isLoading || (!task && !error)) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading task...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Task not found</Text>
            <View style={styles.goBackButton}>
              <Button onPress={handleClose}>Go Back</Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const isCompleted = task.status === 'COMPLETED';

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View 
        style={[
          styles.container, 
          { backgroundColor: colors.background, height: MODAL_HEIGHT, transform: [{ translateY }] }
        ]}
      >
        {/* Handle - swipeable */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Task Details</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
            <View style={[
              styles.statusBadge,
              isCompleted 
                ? { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7' }
                : { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }
            ]}>
              <Text style={[
                styles.statusText,
                isCompleted 
                  ? { color: isDark ? '#4ade80' : '#166534' }
                  : { color: isDark ? '#fbbf24' : '#92400e' }
              ]}>
                {task.status}
              </Text>
            </View>
            {task.description && (
              <Text style={[styles.description, { color: colors.text }]}>{task.description}</Text>
            )}
            {task.dueDate && (
              <Text style={[styles.dueDate, { color: colors.textSecondary }]}>Due: {formatDate(task.dueDate)}</Text>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.toggleButtonWrapper}>
            <Button size="sm" onPress={handleToggle} loading={isToggling}>
              {isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
            </Button>
          </View>
          <View style={styles.actionButtons}>
            <View style={styles.buttonWrapper}>
              <Button variant="outline" size="sm" onPress={handleEdit}>Edit</Button>
            </View>
            <View style={styles.buttonWrapper}>
              <Button variant="destructive" size="sm" onPress={handleDelete} loading={isDeleting}>Delete</Button>
            </View>
          </View>
        </View>
      </Animated.View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  goBackButton: {
    marginTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  statusBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginTop: spacing.lg,
    lineHeight: 24,
  },
  dueDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  toggleButtonWrapper: {
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});
