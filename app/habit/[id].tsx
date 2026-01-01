/**
 * Habit Detail Screen
 * 
 * Displays as a bottom sheet taking 70% of screen height.
 * Supports swipe-to-close gesture on the handle area.
 */

import React, { useRef } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet, Dimensions, Pressable, PanResponder, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHabit, useHabits } from '../../features/habits/hooks/useHabits';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { isCompletedToday } from '../../features/habits/utils/habitUtils';
import { fontFamily, fontSize, spacing } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = 100;

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habit, isLoading, error, refetch } = useHabit(id);
  const { deleteHabit, completeHabit, isDeleting } = useHabits();
  const { success, error: hapticError } = useHaptics();
  const { colors, isDark } = useTheme();

  const completedToday = habit ? isCompletedToday(habit) : false;

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

  const handleComplete = async () => {
    if (!id || completedToday) return;
    try {
      await completeHabit(id);
      await refetch();
      await success();
    } catch (err) {
      await hapticError();
      Alert.alert('Error', 'Failed to complete habit.');
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/modals/edit-habit', params: { id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabit(id!);
            await success();
            router.back();
          } catch (err) {
            await hapticError();
            Alert.alert('Error', 'Failed to delete habit.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (error || !habit) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Habit not found</Text>
            <View style={styles.goBackButton}>
              <Button onPress={handleClose}>Go Back</Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Habit Details</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
            {habit.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{habit.description}</Text>
            )}

            <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
                <Text style={[styles.statValuePrimary, { color: colors.primary }]}>{habit.currentStreak} days</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Streak</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{habit.bestStreak} days</Text>
              </View>
              <View style={styles.statRowLast}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Target Days</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{habit.targetDays} days/week</Text>
              </View>
            </View>

            {completedToday && (
              <View style={[styles.completedBanner, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7' }]}>
                <Text style={[styles.completedText, { color: isDark ? '#4ade80' : '#166534' }]}>Completed today!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {!completedToday && (
            <View style={styles.completeButtonWrapper}>
              <Button size="sm" onPress={handleComplete}>Complete Today</Button>
            </View>
          )}
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
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginTop: spacing.sm,
  },
  statsCard: {
    marginTop: spacing.xl,
    borderRadius: 12,
    padding: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  statValuePrimary: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  completedBanner: {
    marginTop: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
  },
  completedText: {
    fontFamily: fontFamily.medium,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  completeButtonWrapper: {
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
