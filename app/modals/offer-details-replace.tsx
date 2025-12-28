/**
 * Offer Details Replace Modal Screen
 */

import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { JobStatus } from '../../types';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function OfferDetailsReplaceModal() {
  const router = useRouter();
  const { newJobId, existingJobId } = useLocalSearchParams<{ newJobId: string; existingJobId: string }>();
  const { updateJob, isUpdating } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleReplace = async () => {
    if (!newJobId || !existingJobId) return;
    try {
      // Remove accepted status from existing job
      await updateJob({ id: existingJobId, status: JobStatus.OFFERED });
      // Set new job as accepted
      await updateJob({ id: newJobId, status: JobStatus.ACCEPTED });
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to update job status.');
    }
  };

  const handleCancel = () => router.back();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Replace Accepted Offer?
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          You already have an accepted job offer. Would you like to replace it with this one?
        </Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button variant="outline" onPress={handleCancel}>Cancel</Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button onPress={handleReplace} loading={isUpdating}>Replace</Button>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});
