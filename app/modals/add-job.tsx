/**
 * Add Job Modal Screen
 * 
 * Modal for adding a new job application.
 * Uses centralized theme system for consistent styling.
 */

import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { JobForm } from '../../components/jobs/JobForm';
import { JobCreateInput } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function AddJobModal() {
  const router = useRouter();
  const { createJob, isCreating } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Job Application</Text>
      </View>
      <JobForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
        submitLabel="Add Job"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
