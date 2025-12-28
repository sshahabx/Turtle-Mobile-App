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
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJob } from '../../features/jobs/hooks/useJob';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function AcceptedConfirmModal() {
  const router = useRouter();
  const { jobId, existingJobId } = useLocalSearchParams<{
    jobId: string;
    existingJobId: string;
  }>();
  
  const { job: newJob, isLoading: isLoadingNew } = useJob(jobId);
  const { job: existingJob, isLoading: isLoadingExisting } = useJob(existingJobId);

  // Handle cancel - go back without changes
  const handleCancel = () => {
    router.back();
  };

  // Handle replace - proceed to offer details form with replace flag
  const handleReplace = () => {
    // Navigate to offer details with replace flag
    router.replace({
      pathname: '/modals/offer-details-replace',
      params: { 
        jobId, 
        existingJobId,
      },
    });
  };

  // Loading state
  if (isLoadingNew || isLoadingExisting) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
          Replace Accepted Offer?
        </Text>
      </View>

      <View className="flex-1 p-4">
        {/* Warning Icon */}
        <View className="items-center mb-6 mt-4">
          <Text className="text-5xl">⚠️</Text>
        </View>

        {/* Explanation */}
        <Text className="text-center text-gray-700 dark:text-gray-300 mb-6">
          You already have an accepted job offer. Accepting this new offer will replace your current accepted job.
        </Text>

        {/* Current Accepted Job */}
        {existingJob && (
          <Card className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <Text className="text-xs text-green-600 dark:text-green-500 mb-1">
              Currently Accepted
            </Text>
            <Text className="text-lg font-semibold text-green-800 dark:text-green-300">
              {existingJob.title}
            </Text>
            <Text className="text-green-700 dark:text-green-400">
              {existingJob.company}
            </Text>
            {existingJob.offerSalary && (
              <Text className="text-sm text-green-600 dark:text-green-500 mt-1">
                💰 {existingJob.offerSalary}
              </Text>
            )}
          </Card>
        )}

        {/* Arrow */}
        <View className="items-center my-2">
          <Text className="text-2xl text-gray-400">↓</Text>
        </View>

        {/* New Job to Accept */}
        {newJob && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Text className="text-xs text-blue-600 dark:text-blue-500 mb-1">
              New Offer
            </Text>
            <Text className="text-lg font-semibold text-blue-800 dark:text-blue-300">
              {newJob.title}
            </Text>
            <Text className="text-blue-700 dark:text-blue-400">
              {newJob.company}
            </Text>
          </Card>
        )}

        {/* Warning Text */}
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          The previous accepted job will be changed to "Offered" status.
        </Text>

        {/* Action Buttons */}
        <View className="flex-row mt-auto">
          <Button
            variant="outline"
            onPress={handleCancel}
            className="flex-1 mr-2"
          >
            Keep Current
          </Button>
          <Button
            onPress={handleReplace}
            className="flex-1 ml-2"
          >
            Replace Offer
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
