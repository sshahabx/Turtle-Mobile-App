/**
 * AcceptedJobBanner Component
 * 
 * Displays accepted job prominently at top with offer details.
 * 
 * Requirements:
 * - 2.5: Display ACCEPTED job prominently at the top with offer details
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Job } from '../../types';
import { formatDate } from '../../utils/date';

export interface AcceptedJobBannerProps {
  job: Job;
  onPress?: () => void;
}

export function AcceptedJobBanner({ job, onPress }: AcceptedJobBannerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-4 mt-4 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800"
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View className="w-6 h-6 rounded-full bg-green-200 dark:bg-green-800 items-center justify-center mr-2">
          <View className="w-3 h-1.5 border-l-2 border-b-2 border-green-700 dark:border-green-400" style={{ transform: [{ rotate: '-45deg' }], marginTop: -2 }} />
        </View>
        <Text className="text-sm font-semibold text-green-700 dark:text-green-400">
          Accepted Offer
        </Text>
      </View>

      {/* Job Title & Company */}
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {job.offerTitle || job.title}
      </Text>
      <Text className="text-base text-gray-600 dark:text-gray-300 mb-3">
        {job.offerCompany || job.company}
      </Text>

      {/* Offer Details */}
      {(job.offerSalary || job.offerBenefits) && (
        <View className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
          {job.offerSalary && (
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-gray-500 dark:text-gray-400 w-16">
                Salary:
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                {job.offerSalary}
              </Text>
            </View>
          )}
          {job.offerBenefits && (
            <View className="flex-row items-start">
              <Text className="text-sm text-gray-500 dark:text-gray-400 w-16">
                Benefits:
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {job.offerBenefits}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Accepted Date */}
      {job.offerAcceptedDate && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Accepted on {formatDate(job.offerAcceptedDate)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default AcceptedJobBanner;
