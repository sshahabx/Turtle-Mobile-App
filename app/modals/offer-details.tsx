/**
 * Offer Details Modal Screen
 * 
 * Requirements:
 * - 3.1: Navigate to offer details when status changes to OFFERED
 * - 3.2: Pre-populate job title and company from the job being updated
 * - 3.3: Update the job with both the new status and offer details
 */

import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { OfferDetailsForm, OfferDetailsData } from '../../components/jobs/OfferDetailsForm';
import { JobStatus } from '../../types';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function OfferDetailsModal() {
  const router = useRouter();
  const { id, jobTitle, companyName, targetStatus } = useLocalSearchParams<{ 
    id: string;
    jobTitle?: string;
    companyName?: string;
    targetStatus?: string;
  }>();
  const { updateJob, isUpdating } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  // Determine the status to set - default to ACCEPTED if not specified
  const statusToSet = targetStatus === JobStatus.OFFERED 
    ? JobStatus.OFFERED 
    : JobStatus.ACCEPTED;

  const handleSubmit = async (data: OfferDetailsData) => {
    if (!id) return;
    try {
      await updateJob({ 
        id, 
        status: statusToSet,
        offerTitle: data.offerTitle,
        offerCompany: data.offerCompany,
        offerSalary: data.offerSalary,
        offerBenefits: data.offerBenefits,
        offerAcceptedDate: data.offerAcceptedDate,
      });
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to save offer details.');
    }
  };

  const handleCancel = () => router.back();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Offer Details
        </Text>
      </View>
      <OfferDetailsForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        jobTitle={jobTitle}
        companyName={companyName}
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
