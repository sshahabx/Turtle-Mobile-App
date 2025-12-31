/**
 * Habits Screen
 * 
 * Displays user habits with streak tracking and completion.
 * Uses centralized theme system for consistent styling.
 * Features an engaging streak tracker component for user retention.
 * 
 * Requirements:
 * - 4.3: Display LimitBanner for Free tier users showing habits usage
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../../features/habits/hooks/useHabits';
import { Habit } from '../../types';
import { isCompletedToday } from '../../features/habits/utils/habitUtils';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import { StreakTracker } from '../../components/habits/StreakTracker';
import { LimitBanner } from '../../components/ui/LimitBanner';
import { UpgradePrompt } from '../../components/ui/UpgradePrompt';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, isLoading, refetch, completeHabit } = useHabits();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

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

  // Calculate overall streak stats for the header
  const overallStats = useMemo(() => {
    if (habits.length === 0) {
      return { totalStreak: 0, bestStreak: 0, completedToday: false, lastCompleted: undefined };
    }
    
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const anyCompletedToday = habits.some(h => isCompletedToday(h));
    const lastCompletedDates = habits
      .filter(h => h.lastCompleted)
      .map(h => new Date(h.lastCompleted!));
    const lastCompleted = lastCompletedDates.length > 0 
      ? new Date(Math.max(...lastCompletedDates.map(d => d.getTime())))
      : undefined;
    
    // Average streak across all habits
    const avgStreak = Math.round(totalStreak / habits.length);
    
    return { 
      totalStreak: avgStreak, 
      bestStreak, 
      completedToday: anyCompletedToday,
      lastCompleted,
    };
  }, [habits]);

  const renderHabit = ({ item }: { item: Habit }) => {
    const completed = isCompletedToday(item);
    const isCompleting = completingId === item.id;
    const streakLevel = item.currentStreak >= 30 ? 'legendary' : 
                        item.currentStreak >= 14 ? 'hot' : 
                        item.currentStreak >= 7 ? 'warm' : 
                        item.currentStreak >= 3 ? 'building' : 'starting';
    
    const streakColors: Record<string, string> = {
      legendary: '#FF6B35',
      hot: '#FF8C42',
      warm: '#FFB347',
      building: colors.warning,
      starting: colors.primary,
    };
    
    const streakColor = streakColors[streakLevel];
    
    return (
      <TouchableOpacity 
        style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={() => handleHabitPress(item)}
      >
        <View style={styles.habitInfo}>
          <View style={styles.habitHeader}>
            <Text style={[styles.habitName, { color: colors.text }]}>{item.name}</Text>
            {item.currentStreak >= 3 && (
              <View style={[styles.streakBadge, { backgroundColor: `${streakColor}20` }]}>
                <Ionicons name="flame" size={12} color={streakColor} style={styles.fireIconBadge} />
                <Text style={[styles.streakBadgeText, { color: streakColor }]}>
                  {item.currentStreak}
                </Text>
              </View>
            )}
          </View>
          {item.description && (
            <Text style={[styles.habitDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <View style={styles.streakContainer}>
            <View style={[styles.streakIcon, { backgroundColor: streakColor }]} />
            <Text style={[styles.streakText, { color: streakColor }]}>
              {item.currentStreak} day{item.currentStreak !== 1 ? 's' : ''} streak
            </Text>
            {item.bestStreak > item.currentStreak && (
              <Text style={[styles.bestStreak, { color: colors.textTertiary }]}>
                Best: {item.bestStreak}
              </Text>
            )}
          </View>
          {/* Mini progress bar */}
          {item.targetDays > 0 && (
            <View style={styles.miniProgressContainer}>
              <View style={[styles.miniProgressBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View 
                  style={[
                    styles.miniProgressFill, 
                    { 
                      backgroundColor: streakColor,
                      width: `${Math.min(100, (item.currentStreak / item.targetDays) * 100)}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.miniProgressText, { color: colors.textTertiary }]}>
                {item.currentStreak}/{item.targetDays}
              </Text>
            </View>
          )}
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
            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
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

      {/* Limit Banner - Shows usage for Free tier users (Requirement 4.3) */}
      <View style={styles.limitBannerContainer}>
        <LimitBanner 
          entityType="habits"
          entityLabel="habits"
          onUpgradePress={() => setShowUpgradePrompt(true)}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="flame-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Start Building Habits</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Track your daily habits and watch your streaks grow!
          </Text>
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
          ListHeaderComponent={
            <StreakTracker
              currentStreak={overallStats.totalStreak}
              bestStreak={overallStats.bestStreak}
              lastCompleted={overallStats.lastCompleted}
              completedToday={overallStats.completedToday}
            />
          }
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onDismiss={() => setShowUpgradePrompt(false)}
        entityType="habits"
      />
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
  limitBannerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  fireIconBadge: {
    marginRight: 2,
  },
  streakBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
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
  miniProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  miniProgressText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    minWidth: 35,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
