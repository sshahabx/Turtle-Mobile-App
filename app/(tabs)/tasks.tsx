/**
 * Tasks Screen
 * 
 * Displays user tasks with completion tracking.
 * Uses centralized theme system for consistent styling.
 * Features a mood selector for emotional engagement.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../features/tasks/hooks/useTasks';
import { Task, TaskStatus } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import { MoodSelector, MoodType } from '../../components/tasks/MoodSelector';

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, isLoading, refetch, toggleTask } = useTasks();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleTaskPress = (task: Task) => {
    router.push({ pathname: '/task/[id]', params: { id: task.id } });
  };

  const handleAddTask = () => {
    router.push('/modals/add-task');
  };

  const handleToggleStatus = async (taskId: string) => {
    try {
      await toggleTask(taskId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status.');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderTask = ({ item }: { item: Task }) => {
    const isCompleted = item.status === TaskStatus.COMPLETED;
    
    return (
      <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={() => handleTaskPress(item)}
      >
        <TouchableOpacity 
          style={[
            styles.checkbox, 
            { borderColor: isCompleted ? colors.success : colors.border },
            isCompleted && { backgroundColor: colors.success }
          ]}
          onPress={() => handleToggleStatus(item.id)}
        >
          {isCompleted && <View style={[styles.checkmark, { borderColor: colors.textInverse }]} />}
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle, 
            { color: isCompleted ? colors.textTertiary : colors.text },
            isCompleted && styles.taskTitleCompleted
          ]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={[styles.taskDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          {item.dueDate && (
            <Text style={[styles.taskDueDate, { color: colors.textTertiary }]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tasks</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddTask}>
          <Text style={[styles.addButtonText, { color: colors.textInverse }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <MoodSelector onMoodSelect={handleMoodSelect} />
          <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="checkbox-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Ready to be productive?</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add your first task and start checking things off!</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleAddTask}>
            <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>Add Your First Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<MoodSelector onMoodSelect={handleMoodSelect} />}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  taskDueDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
});
