/**
 * Habits Screen
 * 
 * Displays user habits with streak tracking and completion.
 * Uses centralized theme system for consistent styling.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabits } from '../../features/habits/hooks/useHabits';
import { Habit } from '../../types';
import { isCompletedToday } from '../../features/habits/utils/habitUtils';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, isLoading, refetch, completeHabit } = useHabits();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleHabitPress = (habit: Habit) => {
    router.push({ pathname: '/habit/[id]', params: { id: habit.id } });
  };

  const handleAddHabit = () => {
    router.push('/modals/add-habit');
  };

  const handleComplete = async (habitId: string) => {
    setCompletingId(habitId);
    try {
      await completeHabit(habitId);
      await refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete habit.');
    } finally {
      setCompletingId(null);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderHabit = ({ item }: { item: Habit }) => {
    const completed = isCompletedToday(item);
    const isCompleting = completingId === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={() => handleHabitPress(item)}
      >
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, { color: colors.text }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.habitDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <View style={styles.streakContainer}>
            <View style={[styles.streakIcon, { backgroundColor: colors.warning }]} />
            <Text style={[styles.streakText, { color: colors.warning }]}>
              {item.currentStreak} day streak
            </Text>
            <Text style={[styles.bestStreak, { color: colors.textTertiary }]}>
              Best: {item.bestStreak}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.completeButton,
            { backgroundColor: completed ? colors.success : colors.primary },
          ]}
          onPress={() => !completed && handleComplete(item.id)}
          disabled={completed || isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : completed ? (
            <View style={[styles.checkmark, { borderColor: colors.textInverse }]} />
          ) : (
            <Text style={[styles.completeButtonText, { color: colors.textInverse }]}>Done</Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Habits</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddHabit}>
          <Text style={[styles.addButtonText, { color: colors.textInverse }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[styles.emptyIconCircle, { borderColor: colors.textTertiary }]} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No habits yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Build better habits by tracking them daily</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleAddHabit}>
            <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>Add Your First Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  habitDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  streakIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  streakText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  bestStreak: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginLeft: spacing.md,
  },
  completeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  completeButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
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
