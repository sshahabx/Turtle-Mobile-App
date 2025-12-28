/**
 * Edit Task Modal Screen
 */

import React from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTask, useTasks } from '../../features/tasks/hooks/useTasks';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { TaskForm } from '../../components/tasks/TaskForm';
import { TaskCreateInput } from '../../types';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function EditTaskModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { task, isLoading } = useTask(id);
  const { updateTask, isUpdating } = useTasks();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleSubmit = async (data: TaskCreateInput) => {
    if (!id) return;
    try {
      await updateTask({ id, ...data });
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to update task.');
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

  if (!task) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Task not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Task</Text>
      </View>
      <TaskForm
        initialValues={task}
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
