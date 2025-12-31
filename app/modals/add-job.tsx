/**
 * Add Job Modal Screen
 * 
 * Modal for adding a new job application.
 * Uses centralized theme system for consistent styling.
 * Displays as a bottom sheet taking 70% of screen height.
 * 
 * Requirements:
 * - 1.2: Check limits before showing form
 * - 1.4: Show UpgradePrompt if at limit
 */

import React from 'react';
import { View, Text, Alert, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { useLimits } from '../../hooks/useLimits';
import { JobForm } from '../../components/jobs/JobForm';
import { UpgradePrompt } from '../../components/ui/UpgradePrompt';
import { JobCreateInput } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% of screen height

export default function AddJobModal() {
  const router = useRouter();
  const { createJob, isCreating } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();
  const { isAtLimit, isLoading: limitsLoading } = useLimits('jobs');

  const handleSubmit = async (data: JobCreateInput) => {
    try {
      await createJob(data);
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert(
        'Error',
        'Failed to create job application. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleUpgradeDismiss = () => {
    router.back();
  };

  const handleSignInSuccess = () => {
    // Stay on the modal after sign-in so user can add the job
  };

  // Show UpgradePrompt if user is at limit (Requirement 1.2, 1.4)
  if (!limitsLoading && isAtLimit) {
    return (
      <UpgradePrompt
        visible={true}
        onDismiss={handleUpgradeDismiss}
        onSignInSuccess={handleSignInSuccess}
        entityType="jobs"
      />
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleCancel} />
      <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Job Application</Text>
        </View>
        <JobForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating}
          submitLabel="Add Job"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
});
