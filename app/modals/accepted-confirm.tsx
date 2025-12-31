/**
 * Accepted Job Confirm Modal Screen
 * 
 * Modal shown when user tries to accept a job while another job is already accepted.
 * Allows replacing the existing accepted job.
 * 
 * Requirements:
 * - 5.4: Display confirmation dialog when accepting second job
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJob } from '../../features/jobs/hooks/useJob';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function AcceptedConfirmModal() {
  const router = useRouter();
  const { jobId, existingJobId } = useLocalSearchParams<{
    jobId: string;
    existingJobId: string;
  }>();
  const { colors, isDark } = useTheme();
  
  const { job: newJob, isLoading: isLoadingNew } = useJob(jobId);
  const { job: existingJob, isLoading: isLoadingExisting } = useJob(existingJobId);

  const handleCancel = () => {
    router.back();
  };

  const handleReplace = () => {
    router.replace({
      pathname: '/modals/offer-details-replace',
      params: { jobId, existingJobId },
    });
  };

  if (isLoadingNew || isLoadingExisting) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Replace Accepted Offer?</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fef9c3' }]}>
          <View style={[styles.warningTriangle, { borderBottomColor: isDark ? '#facc15' : '#ca8a04' }]} />
        </View>

        <Text style={[styles.explanation, { color: colors.textSecondary }]}>
          You already have an accepted job offer. Accepting this new offer will replace your current accepted job.
        </Text>

        {existingJob && (
          <Card style={[styles.jobCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4', borderColor: isDark ? '#166534' : '#bbf7d0' }]}>
            <Text style={[styles.cardLabel, { color: isDark ? '#4ade80' : '#166534' }]}>Currently Accepted</Text>
            <Text style={[styles.cardTitle, { color: isDark ? '#86efac' : '#166534' }]}>{existingJob.title}</Text>
            <Text style={[styles.cardCompany, { color: isDark ? '#4ade80' : '#15803d' }]}>{existingJob.company}</Text>
            {existingJob.offerSalary && (
              <Text style={[styles.cardSalary, { color: isDark ? '#4ade80' : '#166534' }]}>{existingJob.offerSalary}</Text>
            )}
          </Card>
        )}

        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, { color: colors.textTertiary }]}>↓</Text>
        </View>

        {newJob && (
          <Card style={[styles.jobCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: isDark ? '#1d4ed8' : '#bfdbfe' }]}>
            <Text style={[styles.cardLabel, { color: isDark ? '#60a5fa' : '#1d4ed8' }]}>New Offer</Text>
            <Text style={[styles.cardTitle, { color: isDark ? '#93c5fd' : '#1e40af' }]}>{newJob.title}</Text>
            <Text style={[styles.cardCompany, { color: isDark ? '#60a5fa' : '#1d4ed8' }]}>{newJob.company}</Text>
          </Card>
        )}

        <Text style={[styles.warningText, { color: colors.textTertiary }]}>
          The previous accepted job will be changed to "Offered" status.
        </Text>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button variant="outline" onPress={handleCancel}>Keep Current</Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button onPress={handleReplace}>Replace Offer</Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1 },
  headerTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.xl, textAlign: 'center' },
  content: { flex: 1, padding: spacing.lg },
  iconContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    marginBottom: spacing.lg, 
    marginTop: spacing.lg 
  },
  warningTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  explanation: { fontFamily: fontFamily.regular, fontSize: fontSize.base, textAlign: 'center', marginBottom: spacing.lg },
  jobCard: { marginBottom: spacing.lg, borderWidth: 1 },
  cardLabel: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginBottom: spacing.xs },
  cardTitle: { fontFamily: fontFamily.semibold, fontSize: fontSize.lg },
  cardCompany: { fontFamily: fontFamily.regular, fontSize: fontSize.base },
  cardSalary: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, marginTop: spacing.xs },
  arrowContainer: { alignItems: 'center', marginVertical: spacing.sm },
  arrow: { fontSize: 24 },
  warningText: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.lg },
  buttonRow: { flexDirection: 'row', marginTop: 'auto', gap: spacing.md },
  buttonWrapper: { flex: 1 },
});
