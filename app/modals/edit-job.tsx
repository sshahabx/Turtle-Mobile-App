/**
 * Edit Job Modal Screen
 * 
 * Modal for editing an existing job application.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 3.1: Navigate to offer details when status changes to OFFERED
 * - 4.1: Navigate to offer details when status changes to ACCEPTED (no existing accepted job)
 * - 4.2: Navigate to accepted confirmation when status changes to ACCEPTED (existing accepted job)
 */

import React from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJob } from '../../features/jobs/hooks/useJob';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { JobForm } from '../../components/jobs/JobForm';
import { JobCreateInput, JobStatus } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';
import { determineStatusWorkflow, requiresWorkflowHandling } from '../../features/jobs/utils/statusWorkflow';

export default function EditJobModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { job, isLoading: isLoadingJob } = useJob(id);
  const { jobs, updateJob, isUpdating } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleSubmit = async (data: JobCreateInput) => {
    if (!id || !job) return;
    
    const newStatus = data.status ?? job.status;
    const currentStatus = job.status;
    
    // Check if status change requires workflow handling
    if (newStatus !== currentStatus && requiresWorkflowHandling(newStatus)) {
      const workflow = determineStatusWorkflow(newStatus, currentStatus, jobs, id);
      
      if (workflow.shouldNavigateToAcceptedConfirm && workflow.existingAcceptedJobId) {
        // Navigate to accepted confirmation modal
        // First update the job with non-status changes, then navigate
        try {
          const { status, ...nonStatusData } = data;
          if (Object.keys(nonStatusData).length > 0) {
            await updateJob({ id, ...nonStatusData });
          }
          router.replace({
            pathname: '/modals/accepted-confirm',
            params: { 
              jobId: id, 
              existingJobId: workflow.existingAcceptedJobId 
            },
          });
          return;
        } catch (error) {
          await hapticError();
          Alert.alert('Error', 'Failed to update job application.');
          return;
        }
      }
      
      if (workflow.shouldNavigateToOfferDetails) {
        // Navigate to offer details modal with job data
        try {
          const { status, ...nonStatusData } = data;
          if (Object.keys(nonStatusData).length > 0) {
            await updateJob({ id, ...nonStatusData });
          }
          router.replace({
            pathname: '/modals/offer-details',
            params: { 
              id,
              jobTitle: data.title || job.title,
              companyName: data.company || job.company,
              targetStatus: newStatus,
            },
          });
          return;
        } catch (error) {
          await hapticError();
          Alert.alert('Error', 'Failed to update job application.');
          return;
        }
      }
    }
    
    // Standard update without workflow
    try {
      await updateJob({ id, ...data });
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to update job application.');
    }
  };

  const handleCancel = () => router.back();

  if (isLoadingJob) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Job not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Job Application</Text>
      </View>
      <JobForm
        initialValues={job}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        submitLabel="Save Changes"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
});
