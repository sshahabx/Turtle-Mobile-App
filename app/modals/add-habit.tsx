/**
 * Add Habit Modal Screen
 * 
 * Modal for adding a new habit.
 * Displays as a bottom sheet taking 70% of screen height.
 * 
 * Requirements:
 * - 4.2: Check limits before showing form
 * - 4.4: Show UpgradePrompt if at limit
 */

import React from 'react';
import { View, Text, Alert, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabits } from '../../features/habits/hooks/useHabits';
import { useHaptics } from '../../hooks';
import { useLimits } from '../../hooks/useLimits';
import { HabitForm } from '../../components/habits/HabitForm';
import { UpgradePrompt } from '../../components/ui/UpgradePrompt';
import { HabitCreateInput } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function AddHabitModal() {
  const router = useRouter();
  const { createHabit, isCreating } = useHabits();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();
  const { isAtLimit, isLoading: limitsLoading } = useLimits('habits');

  const handleSubmit = async (data: HabitCreateInput) => {
    try {
      await createHabit(data);
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to create habit.');
    }
  };

  const handleCancel = () => router.back();

  const handleUpgradeDismiss = () => {
    router.back();
  };

  const handleSignInSuccess = () => {
    // Stay on the modal after sign-in so user can add the habit
  };

  // Show UpgradePrompt if user is at limit (Requirement 4.2, 4.4)
  if (!limitsLoading && isAtLimit) {
    return (
      <UpgradePrompt
        visible={true}
        onDismiss={handleUpgradeDismiss}
        onSignInSuccess={handleSignInSuccess}
        entityType="habits"
      />
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleCancel} />
      <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Habit</Text>
        </View>
        <HabitForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating}
          submitLabel="Add Habit"
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
});
