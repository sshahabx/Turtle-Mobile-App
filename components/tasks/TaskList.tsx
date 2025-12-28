/**
 * TaskList Component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, RefreshControl, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Task } from '../../types';
import { sortTasksByStatusAndDueDate } from '../../features/tasks/utils/taskUtils';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../dashboard/EmptyState';

export interface TaskListProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onToggleStatus?: (taskId: string) => void;
  onAddTask?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

const ItemSeparator = memo(() => <View style={styles.separator} />);
ItemSeparator.displayName = 'ItemSeparator';

export const TaskList = memo(function TaskList({
  tasks,
  onTaskPress,
  onToggleStatus,
  onAddTask,
  isRefreshing = false,
  onRefresh,
  emptyTitle = 'No tasks yet',
  emptyMessage = 'Stay organized by adding your first task.',
}: TaskListProps) {
  const sortedTasks = useMemo(() => sortTasksByStatusAndDueDate(tasks), [tasks]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => onTaskPress?.(item)}
      onToggleStatus={() => onToggleStatus?.(item.id)}
    />
  ), [onTaskPress, onToggleStatus]);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (sortedTasks.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon="check"
        actionLabel="Add Your First Task"
        onAction={onAddTask}
      />
    );
  }

  return (
    <FlashList
      data={sortedTasks}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  separator: {
    height: 4,
  },
});

export default TaskList;
