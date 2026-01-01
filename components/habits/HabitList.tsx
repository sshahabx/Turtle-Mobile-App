/**
 * HabitList Component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, RefreshControl, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Habit } from '../../types';
import { sortHabitsByCompletion } from '../../features/habits/utils/habitUtils';
import { HabitCard } from './HabitCard';
import { EmptyState } from '../dashboard/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export interface HabitListProps {
  habits: Habit[];
  onHabitPress?: (habit: Habit) => void;
  onComplete?: (habitId: string) => void;
  onAddHabit?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
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
  isLoading = false,
  completingHabitId = null,
  emptyTitle = 'No habits yet',
  emptyMessage = 'Build consistent routines by adding your first habit.',
}: HabitListProps) {
  const { colors } = useTheme();
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

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading habits...</Text>
      </View>
    );
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});

export default HabitList;
