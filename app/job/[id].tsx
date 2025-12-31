/**
 * Job Detail Screen
 * 
 * Displays as a bottom sheet taking 70% of screen height.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJob } from '../../features/jobs/hooks/useJob';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../components/ui/Toast';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { JobStatus } from '../../types';
import { formatDate } from '../../utils/date';
import { fontFamily, fontSize, spacing, statusColors } from '../../theme';
import { determineStatusWorkflow } from '../../features/jobs/utils/statusWorkflow';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% of screen height

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { job, isLoading, error } = useJob(id);
  const { jobs, updateStatus, deleteJob, isDeleting } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState<JobStatus | null>(null);

  const handleClose = () => {
    router.back();
  };

  const handleStatusChange = async (status: JobStatus) => {
    if (!id || updatingStatus || !job) return;
    
    // Don't update if already at this status
    if (job.status === status) return;
    
    // Check if this status change requires workflow handling
    const workflow = determineStatusWorkflow(status, job.status, jobs, id);
    
    if (workflow.shouldNavigateToOfferDetails) {
      // Navigate to offer details modal with job info (replace to close job details)
      router.replace({
        pathname: '/modals/offer-details',
        params: {
          id,
          jobTitle: job.title,
          companyName: job.company,
          targetStatus: status,
          // Pass existing offer details for pre-population when changing to ACCEPTED
          existingSalary: job.offerSalary || '',
          existingBenefits: job.offerBenefits || '',
        },
      });
      return;
    }
    
    if (workflow.shouldNavigateToAcceptedConfirm) {
      // Navigate to accepted confirmation modal
      router.push({
        pathname: '/modals/accepted-confirm',
        params: {
          jobId: id,
          existingJobId: workflow.existingAcceptedJobId,
        },
      });
      return;
    }
    
    // For other status changes, update directly
    setUpdatingStatus(status);
    try {
      await updateStatus({ id, status });
      await success();
      showToast(`Status updated to ${status}`, 'success');
    } catch (err) {
      await hapticError();
      showToast('Failed to update status. Please try again.', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/modals/edit-job', params: { id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete Job', 'Are you sure you want to delete this job application?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJob(id!);
            await success();
            showToast('Job deleted successfully', 'success');
            router.back();
          } catch (err) {
            await hapticError();
            showToast('Failed to delete job. Please try again.', 'error');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: JobStatus) => {
    const statusKey = status.toLowerCase() as keyof typeof statusColors;
    return statusColors[statusKey] || colors.primary;
  };

  if (isLoading) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Job not found</Text>
            <View style={styles.goBackButton}>
              <Button onPress={handleClose}>Go Back</Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Special view for ACCEPTED jobs - show congratulations and offer details
  if (job.status === JobStatus.ACCEPTED) {
    const acceptedColor = statusColors.accepted;
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Accepted Offer</Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Congratulations Card */}
              <View style={[styles.congratsCard, { backgroundColor: `${acceptedColor}15`, borderColor: acceptedColor }]}>
                <View style={[styles.congratsIconContainer, { backgroundColor: acceptedColor }]}>
                  <Ionicons name="checkmark" size={32} color="#fff" />
                </View>
                <Text style={[styles.congratsTitle, { color: acceptedColor }]}>
                  Congratulations
                </Text>
                <Text style={[styles.congratsSubtitle, { color: colors.textSecondary }]}>
                  You accepted this offer
                </Text>
              </View>

              {/* Job Info */}
              <View style={styles.acceptedJobInfo}>
                <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
                <Text style={[styles.company, { color: colors.textSecondary }]}>{job.company}</Text>
              </View>

              {/* Offer Details */}
              <View style={styles.offerDetailsSection}>
                {job.offerSalary && (
                  <View style={[styles.offerDetailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="cash-outline" size={20} color={acceptedColor} />
                    <View style={styles.offerDetailContent}>
                      <Text style={[styles.offerDetailLabel, { color: colors.textSecondary }]}>Salary</Text>
                      <Text style={[styles.offerDetailValue, { color: colors.text }]}>{job.offerSalary}</Text>
                    </View>
                  </View>
                )}

                {job.offerBenefits && (
                  <View style={[styles.offerDetailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="gift-outline" size={20} color={acceptedColor} />
                    <View style={styles.offerDetailContent}>
                      <Text style={[styles.offerDetailLabel, { color: colors.textSecondary }]}>Benefits</Text>
                      <Text style={[styles.offerDetailValue, { color: colors.text }]}>{job.offerBenefits}</Text>
                    </View>
                  </View>
                )}

                {job.offerAcceptedDate && (
                  <View style={[styles.offerDetailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="calendar-outline" size={20} color={acceptedColor} />
                    <View style={styles.offerDetailContent}>
                      <Text style={[styles.offerDetailLabel, { color: colors.textSecondary }]}>Accepted Date</Text>
                      <Text style={[styles.offerDetailValue, { color: colors.text }]}>{formatDate(job.offerAcceptedDate)}</Text>
                    </View>
                  </View>
                )}

                {job.platform && (
                  <View style={[styles.offerDetailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.offerDetailContent}>
                      <Text style={[styles.offerDetailLabel, { color: colors.textSecondary }]}>Platform</Text>
                      <Text style={[styles.offerDetailValue, { color: colors.text }]}>{job.platform}</Text>
                    </View>
                  </View>
                )}
              </View>

              {job.notes && (
                <View style={styles.notesSection}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Notes</Text>
                  <Text style={[styles.notesText, { color: colors.text }]}>{job.notes}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.buttonWrapper}>
              <Button variant="outline" onPress={handleClose}>Close</Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Job Details</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Job Title and Company */}
            <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
            <Text style={[styles.company, { color: colors.textSecondary }]}>{job.company}</Text>
            <View style={styles.badgeContainer}>
              <StatusBadge status={job.status} />
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              {job.platform && (
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Platform</Text>
                  <Text style={[styles.infoCardValue, { color: colors.text }]}>{job.platform}</Text>
                </View>
              )}

              {job.deadline && (
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Deadline</Text>
                  <Text style={[styles.infoCardValue, { color: colors.text }]}>{formatDate(job.deadline)}</Text>
                </View>
              )}
            </View>

            {job.notes && (
              <View style={styles.notesSection}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Notes</Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{job.notes}</Text>
              </View>
            )}

            {/* Status Update */}
            <View style={styles.statusSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Update Status</Text>
              <View style={styles.statusButtons}>
                {Object.values(JobStatus).map((status) => {
                  const isCurrentStatus = job.status === status;
                  const isUpdating = updatingStatus === status;
                  const statusColor = getStatusColor(status);
                  return (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleStatusChange(status)}
                      disabled={isUpdating || updatingStatus !== null}
                      style={[
                        styles.statusButton,
                        { backgroundColor: `${statusColor}15`, borderColor: statusColor },
                        isCurrentStatus && { backgroundColor: statusColor },
                        (isUpdating || (updatingStatus !== null && !isCurrentStatus)) && { opacity: 0.6 },
                      ]}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color={isCurrentStatus ? '#fff' : statusColor} />
                      ) : (
                        <Text style={[
                          styles.statusButtonText,
                          { color: statusColor },
                          isCurrentStatus && { color: '#fff' },
                        ]}>
                          {status}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.buttonWrapper}>
            <Button variant="outline" onPress={handleEdit}>Edit</Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button variant="destructive" onPress={handleDelete} loading={isDeleting}>Delete</Button>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  goBackButton: {
    marginTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  company: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    marginTop: spacing.xs,
  },
  badgeContainer: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  infoCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoCardLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  infoCardValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  notesSection: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  statusSection: {
    marginTop: spacing.lg,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
  congratsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  congratsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  congratsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    marginBottom: spacing.xs,
  },
  congratsSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  acceptedJobInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  offerDetailsSection: {
    gap: spacing.md,
  },
  offerDetailCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
  },
  offerDetailContent: {
    flex: 1,
  },
  offerDetailLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  offerDetailValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
});
