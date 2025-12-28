/**
 * Goal Setting Modal Screen
 * 
 * Modal for setting the user's daily job application goal.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 6.3: Display form to set DailyGoal between 1 and 50
 * - 14.4: Provide haptic feedback on action completion
 */

import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGoal, validateGoal } from '../../features/user';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export default function GoalSettingModal() {
  const router = useRouter();
  const { dailyGoal, isUpdating, updateGoal } = useGoal();
  const [goalValue, setGoalValue] = useState(dailyGoal.toString());
  const [error, setError] = useState<string | undefined>();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  // Handle goal value change
  const handleGoalChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    setGoalValue(numericText);
    
    // Clear error when user starts typing
    if (error) {
      setError(undefined);
    }
  };

  // Validate and submit the goal
  const handleSubmit = async () => {
    const numericGoal = parseInt(goalValue, 10);
    
    // Validate the goal
    if (isNaN(numericGoal)) {
      setError('Please enter a valid number');
      return;
    }

    const validation = validateGoal(numericGoal);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      await updateGoal(numericGoal);
      await success(); // Haptic feedback on successful save
      router.back();
    } catch (err) {
      await hapticError(); // Haptic feedback on error
      Alert.alert(
        'Error',
        'Failed to update goal. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Set Daily Goal
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Set your daily job application goal to stay motivated and track your progress.
            </Text>
          </View>

          {/* Goal Input */}
          <View style={styles.inputContainer}>
            <Input
              label="Daily Goal"
              value={goalValue}
              onChangeText={handleGoalChange}
              keyboardType="number-pad"
              placeholder="Enter a number between 1 and 50"
              error={error}
              maxLength={2}
              autoFocus
            />
            <Text style={[styles.helperText, { color: colors.textTertiary }]}>
              Recommended: 3-10 applications per day
            </Text>
          </View>

          {/* Current Goal Info */}
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Current goal: {dailyGoal} applications per day
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Button
                variant="outline"
                onPress={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                onPress={handleSubmit}
                loading={isUpdating}
                disabled={isUpdating || !goalValue}
              >
                Save Goal
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  descriptionContainer: {
    marginBottom: spacing['2xl'],
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
  },
  inputContainer: {
    marginBottom: spacing['2xl'],
  },
  helperText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  infoBox: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  infoText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});
