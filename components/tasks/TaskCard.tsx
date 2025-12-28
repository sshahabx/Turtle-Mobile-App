/**
 * TaskCard Component
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Task, TaskStatus } from '../../types';
import { formatRelativeDate } from '../../utils/date';
import { useHaptics } from '../../hooks';

export interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggleStatus?: () => void;
}

function formatDueDate(dueDate: Date | undefined): { text: string; isOverdue: boolean } {
  if (!dueDate) {
    return { text: '', isOverdue: false };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const isOverdue = due.getTime() < now.getTime();
  const text = formatRelativeDate(dueDate);

  return { text: `Due ${text}`, isOverdue };
}

export const TaskCard = memo(function TaskCard({ 
  task, 
  onPress, 
  onToggleStatus 
}: TaskCardProps) {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const { text: dueDateText, isOverdue } = formatDueDate(task.dueDate);
  const { selection, success } = useHaptics();

  const handleToggleStatus = useCallback(async () => {
    if (isCompleted) {
      await selection();
    } else {
      await success();
    }
    onToggleStatus?.();
  }, [isCompleted, selection, success, onToggleStatus]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, isCompleted && styles.cardCompleted]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            handleToggleStatus();
          }}
          style={[
            styles.checkbox,
            isCompleted ? styles.checkboxDone : styles.checkboxPending,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isCompleted && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.dueDate && (
            <Text
              style={[
                styles.dueDate,
                isCompleted && styles.dueDateCompleted,
                !isCompleted && isOverdue && styles.dueDateOverdue,
              ]}
            >
              {dueDateText}
            </Text>
          )}
        </View>

        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkboxPending: {
    borderColor: '#d1d5db',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  titleCompleted: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  dueDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  dueDateCompleted: {
    color: '#9ca3af',
  },
  dueDateOverdue: {
    color: '#ef4444',
  },
  chevron: {
    color: '#9ca3af',
    marginLeft: 8,
    fontSize: 20,
  },
});

export default TaskCard;
