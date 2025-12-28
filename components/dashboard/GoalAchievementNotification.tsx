/**
 * GoalAchievementNotification Component
 * 
 * Displays a celebratory notification when the daily goal is reached.
 * 
 * Requirements:
 * - 6.4: Display celebratory notification when DailyGoal is reached
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Modal, TouchableOpacity } from 'react-native';

export interface GoalAchievementNotificationProps {
  visible: boolean;
  onDismiss: () => void;
  goalCount: number;
}

export function GoalAchievementNotification({
  visible,
  onDismiss,
  goalCount,
}: GoalAchievementNotificationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in with a bounce effect
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDismiss}
        className="flex-1 items-center justify-center bg-black/50"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-8 items-center shadow-xl"
        >
          {/* Success Icon */}
          <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
            <View className="w-8 h-4 border-l-4 border-b-4 border-green-600 dark:border-green-400" style={{ transform: [{ rotate: '-45deg' }], marginTop: -4 }} />
          </View>
          
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Goal Achieved!
          </Text>
          
          {/* Message */}
          <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-4">
            You've reached your daily goal of {goalCount} job applications!
          </Text>
          
          {/* Motivational Message */}
          <View className="bg-green-100 dark:bg-green-900/30 rounded-lg px-4 py-2 mb-4">
            <Text className="text-green-700 dark:text-green-300 text-center font-medium">
              Keep up the great work!
            </Text>
          </View>
          
          {/* Dismiss Button */}
          <TouchableOpacity
            onPress={handleDismiss}
            className="bg-primary-600 rounded-lg px-6 py-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

export default GoalAchievementNotification;
