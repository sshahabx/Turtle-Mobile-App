/**
 * Task Detail Screen
 */

import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTask, useTasks } from '../../features/tasks/hooks/useTasks';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/date';
import { fontFamily, fontSize, spacing, semanticColors } from '../../theme';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { task, isLoading, error } = useTask(id);
  const { deleteTask, toggleTask, isDeleting } = useTasks();
  const { success, error: hapticError } = useHaptics();
  const { colors, isDark } = useTheme();

  const handleToggle = async () => {
    if (!id) return;
    try {
      await toggleTask(id);
      await success();
    } catch (err) {
      await hapticError();
      Alert.alert('Error', 'Failed to update task.');
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Task not found</Text>
        <View style={styles.goBackButton}>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === 'COMPLETED';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.toggleButtonWrapper}>
          <Button onPress={handleToggle}>
            {isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
          </Button>
        </View>
        <View style={styles.actionButtons}>
          <View style={styles.buttonWrapper}>
            <Button variant="outline" onPress={handleEdit}>Edit</Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button variant="destructive" onPress={handleDelete} loading={isDeleting}>Delete</Button>
          </View>
        </View>
      </View>
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
  scrollContent: {
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
