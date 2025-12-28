/**
 * HabitCard Component
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Habit } from '../../types';
import { isCompletedToday, getStreakInfo } from '../../features/habits/utils/habitUtils';
import { formatRelativeDate } from '../../utils/date';
import { useHaptics } from '../../hooks';

export interface HabitCardProps {
  habit: Habit;
  onPress?: () => void;
  onComplete?: () => void;
  isCompleting?: boolean;
}

export const HabitCard = memo(function HabitCard({ 
  habit, 
  onPress, 
  onComplete, 
  isCompleting = false 
}: HabitCardProps) {
  const completedToday = isCompletedToday(habit);
  const { currentStreak, bestStreak, streakPercentage } = getStreakInfo(habit);
  const { success } = useHaptics();

  const handleComplete = useCallback(async () => {
    if (!completedToday && !isCompleting) {
      await success();
      onComplete?.();
    }
  }, [completedToday, isCompleting, success, onComplete]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      <View style={styles.row}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            handleComplete();
          }}
          disabled={completedToday || isCompleting}
          style={[
            styles.completeButton,
            completedToday ? styles.completeButtonDone : styles.completeButtonPending,
            isCompleting && styles.completeButtonDisabled,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {completedToday ? (
            <Text style={styles.checkmarkDone}>✓</Text>
          ) : (
            <Text style={styles.checkmarkPending}>○</Text>
          )}
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {habit.name}
          </Text>

          <View style={styles.streakRow}>
            <Text style={styles.streakText}>
              {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
            </Text>
            {bestStreak > 0 && bestStreak > currentStreak && (
              <Text style={styles.bestStreak}>(Best: {bestStreak})</Text>
            )}
          </View>

          <Text style={[styles.statusText, completedToday && styles.statusTextCompleted]}>
            {completedToday 
              ? 'Completed today' 
              : habit.lastCompleted 
                ? `Last: ${formatRelativeDate(habit.lastCompleted)}`
                : 'Not yet completed'
            }
          </Text>

          {habit.targetDays > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    completedToday ? styles.progressFillDone : styles.progressFillPending,
                    { width: `${Math.min(100, streakPercentage)}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStreak}/{habit.targetDays} days
              </Text>
            </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDone: {
    backgroundColor: '#22c55e',
  },
  completeButtonPending: {
    backgroundColor: '#eff6ff',
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  checkmarkDone: {
    color: '#ffffff',
    fontSize: 18,
  },
  checkmarkPending: {
    color: '#3b82f6',
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bestStreak: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusTextCompleted: {
    color: '#22c55e',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFillDone: {
    backgroundColor: '#22c55e',
  },
  progressFillPending: {
    backgroundColor: '#3b82f6',
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  chevron: {
    color: '#9ca3af',
    marginLeft: 8,
    fontSize: 20,
  },
});

export default HabitCard;
