/**
 * HabitList Component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, RefreshControl, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Habit } from '../../types';
import { sortHabitsByCompletion } from '../../features/habits/utils/habitUtils';
import { HabitCard } from './HabitCard';
import { EmptyState } from '../dashboard/EmptyState';

export interface HabitListProps {
  habits: Habit[];
  onHabitPress?: (habit: Habit) => void;
  onComplete?: (habitId: string) => void;
  onAddHabit?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  completingHabitId?: string | null;
  emptyTitle?: string;
  emptyMessage?: string;
}

const ItemSeparator = memo(() => <View style={styles.separator} />);
ItemSeparator.displayName = 'ItemSeparator';

export const HabitList = memo(function HabitList({
  habits,
  onHabitPress,
  onComplete,
  onAddHabit,
  isRefreshing = false,
  onRefresh,
  completingHabitId = null,
  emptyTitle = 'No habits yet',
  emptyMessage = 'Build consistent routines by adding your first habit.',
}: HabitListProps) {
  const sortedHabits = useMemo(() => sortHabitsByCompletion(habits), [habits]);

  const renderItem = useCallback(({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      onPress={() => onHabitPress?.(item)}
      onComplete={() => onComplete?.(item.id)}
      isCompleting={completingHabitId === item.id}
    />
  ), [onHabitPress, onComplete, completingHabitId]);

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  if (sortedHabits.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon="target"
        actionLabel="Add Your First Habit"
        onAction={onAddHabit}
      />
    );
  }

  return (
    <FlashList
      data={sortedHabits}
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
      extraData={completingHabitId}
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

export default HabitList;
