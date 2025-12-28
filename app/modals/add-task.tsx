/**
 * Add Task Modal Screen
 * 
 * Modal for adding a new task.
 * Uses centralized theme system for consistent styling.
 */

import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTasks } from '../../features/tasks/hooks/useTasks';
import { useHaptics } from '../../hooks';
import { TaskForm } from '../../components/tasks/TaskForm';
import { TaskCreateInput } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function AddTaskModal() {
  const router = useRouter();
  const { createTask, isCreating } = useTasks();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleSubmit = async (data: TaskCreateInput) => {
    try {
      await createTask(data);
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to create task.');
    }
  };

  const handleCancel = () => router.back();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Task</Text>
      </View>
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
        submitLabel="Add Task"
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
