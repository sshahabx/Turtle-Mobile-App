/**
 * Add Habit Modal Screen
 * 
 * Modal for adding a new habit.
 * Uses centralized theme system for consistent styling.
 */

import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabits } from '../../features/habits/hooks/useHabits';
import { useHaptics } from '../../hooks';
import { HabitForm } from '../../components/habits/HabitForm';
import { HabitCreateInput } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function AddHabitModal() {
  const router = useRouter();
  const { createHabit, isCreating } = useHabits();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Habit</Text>
      </View>
      <HabitForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
        submitLabel="Add Habit"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
});
