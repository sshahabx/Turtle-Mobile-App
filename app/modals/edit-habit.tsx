/**
 * Edit Habit Modal Screen
 */

import React from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHabit, useHabits } from '../../features/habits/hooks/useHabits';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { HabitForm } from '../../components/habits/HabitForm';
import { HabitCreateInput } from '../../types';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function EditHabitModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habit, isLoading } = useHabit(id);
  const { updateHabit, isUpdating } = useHabits();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleSubmit = async (data: HabitCreateInput) => {
    if (!id) return;
    try {
      await updateHabit({ id, ...data });
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to update habit.');
    }
  };

  const handleCancel = () => router.back();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Habit not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Habit</Text>
      </View>
      <HabitForm
        initialValues={habit}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        submitLabel="Save Changes"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
});
