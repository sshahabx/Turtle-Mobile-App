/**
 * StreakTracker Component
 * 
 * A visually engaging streak tracker with fire animation effect,
 * weekly calendar view, and motivational messages.
 * Designed to be addictive and encourage daily habit completion.
 */

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export interface StreakTrackerProps {
  currentStreak: number;
  bestStreak: number;
  lastCompleted?: Date;
  completedToday: boolean;
  onPress?: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getWeekDays(): { day: string; date: Date; isToday: boolean }[] {
  const today = new Date();
  const currentDay = today.getDay();
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + i);
    days.push({
      day: WEEKDAYS[i],
      date,
      isToday: i === currentDay,
    });
  }
  
  return days;
}

function getMotivationalMessage(streak: number, completedToday: boolean): string {
  if (completedToday) {
    if (streak >= 30) return "Legendary! You're unstoppable!";
    if (streak >= 14) return "On fire! Keep the momentum!";
    if (streak >= 7) return "Amazing week! You're crushing it!";
    if (streak >= 3) return "Great progress! Keep going!";
    return "Nice work today!";
  }
  
  if (streak > 0) {
    return `Don't break your ${streak} day streak!`;
  }
  return "Start your streak today!";
}

export const StreakTracker = memo(function StreakTracker({
  currentStreak,
  bestStreak,
  lastCompleted,
  completedToday,
  onPress,
}: StreakTrackerProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fireAnim = useRef(new Animated.Value(0)).current;
  const weekDays = getWeekDays();
  
  // Pulse animation for active streak
  useEffect(() => {
    if (currentStreak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStreak, pulseAnim]);

  // Fire flicker animation
  useEffect(() => {
    if (currentStreak >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fireAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fireAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStreak, fireAnim]);

  const fireScale = fireAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const getStreakColor = () => {
    if (currentStreak >= 30) return '#FF6B35'; // Orange-red for legendary
    if (currentStreak >= 14) return '#FF8C42'; // Orange for hot
    if (currentStreak >= 7) return '#FFB347';  // Light orange for warm
    if (currentStreak >= 3) return colors.warning;
    return colors.primary;
  };

  const streakColor = getStreakColor();
  const message = getMotivationalMessage(currentStreak, completedToday);

  // Check if a day was completed - only mark today if completedToday is true
  const isDayCompleted = (date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only mark today as completed if completedToday is true
    if (checkDate.getTime() === today.getTime()) {
      return completedToday;
    }
    
    // For past days, we need actual completion data
    // Since we don't have historical data, only show today's completion
    return false;
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Streak Counter */}
      <View style={styles.streakSection}>
        <Animated.View 
          style={[
            styles.streakCircle, 
            { 
              backgroundColor: `${streakColor}20`,
              borderColor: streakColor,
              transform: [{ scale: currentStreak > 0 ? pulseAnim : 1 }],
            }
          ]}
        >
          {currentStreak >= 3 && (
            <Animated.View 
              style={[
                styles.fireIconContainer,
                { transform: [{ scale: fireScale }] }
              ]}
            >
              <Ionicons name="flame" size={18} color={streakColor} />
            </Animated.View>
          )}
          <Text style={[styles.streakNumber, { color: streakColor }]}>
            {currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            day{currentStreak !== 1 ? 's' : ''}
          </Text>
        </Animated.View>
        
        <View style={styles.streakInfo}>
          <Text style={[styles.motivationalText, { color: colors.text }]}>
            {message}
          </Text>
          {bestStreak > currentStreak && (
            <View style={styles.bestStreakRow}>
              <Ionicons name="trophy-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.bestStreakText, { color: colors.textTertiary }]}>
                Personal best: {bestStreak} days
              </Text>
            </View>
          )}
          {currentStreak >= bestStreak && currentStreak > 0 && (
            <View style={styles.bestStreakRow}>
              <Ionicons name="star" size={14} color={streakColor} />
              <Text style={[styles.bestStreakText, { color: streakColor }]}>
                New personal best!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Weekly Calendar */}
      <View style={styles.weekContainer}>
        {weekDays.map((item, index) => {
          const completed = isDayCompleted(item.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const checkDate = new Date(item.date);
          checkDate.setHours(0, 0, 0, 0);
          const isFuture = checkDate > today;
          
          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={[
                styles.dayLabel, 
                { color: item.isToday ? colors.primary : colors.textTertiary }
              ]}>
                {item.day}
              </Text>
              <View style={[
                styles.dayCircle,
                {
                  backgroundColor: completed 
                    ? streakColor 
                    : item.isToday 
                      ? `${colors.primary}30`
                      : colors.backgroundSecondary,
                  borderColor: item.isToday && !completed ? colors.primary : 'transparent',
                  borderWidth: item.isToday && !completed ? 2 : 0,
                  opacity: isFuture ? 0.4 : 1,
                }
              ]}>
                {completed && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Container>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  fireIconContainer: {
    position: 'absolute',
    top: -2,
  },
  streakNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
  },
  streakLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: -2,
  },
  streakInfo: {
    flex: 1,
  },
  motivationalText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
  },
  bestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bestStreakText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default StreakTracker;
