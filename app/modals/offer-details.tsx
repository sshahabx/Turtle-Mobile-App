/**
 * Offer Details Modal Screen
 */

import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { OfferDetailsForm } from '../../components/jobs/OfferDetailsForm';
import { JobStatus } from '../../types';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function OfferDetailsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateJob, isUpdating } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleSubmit = async (data: { offerSalary?: string; offerBenefits?: string; offerAcceptedDate?: Date }) => {
    if (!id) return;
    try {
      await updateJob({ id, status: JobStatus.ACCEPTED, ...data });
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
