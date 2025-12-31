/**
 * MoodSelector Component
 * 
 * A "How are you feeling today?" component with emoji-based mood options.
 * Designed to add a personal touch and emotional connection to the tasks screen.
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodType = 'amazing' | 'happy' | 'neutral' | 'sad' | 'stressed';

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  message: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { type: 'amazing', emoji: '🤩', label: 'Amazing', color: '#FFD700', message: "You're on fire! Let's crush those tasks!" },
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#4CAF50', message: "Great mood! Perfect time to be productive!" },
  { type: 'neutral', emoji: '😐', label: 'Okay', color: '#9E9E9E', message: "Every step counts. You've got this!" },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#5C6BC0', message: "It's okay to have off days. Be gentle with yourself." },
  { type: 'stressed', emoji: '😤', label: 'Stressed', color: '#FF5722', message: "Take a deep breath. One task at a time." },
];

const MOOD_STORAGE_KEY = '@mood_today';

export interface MoodSelectorProps {
  onMoodSelect?: (mood: MoodType) => void;
}

export const MoodSelector = memo(function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(MOOD_OPTIONS.map(() => new Animated.Value(1))).current;

  // Load saved mood on mount
  useEffect(() => {
    loadTodaysMood();
  }, []);

  // Animate message appearance
  useEffect(() => {
    if (showMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showMessage, fadeAnim]);

  const loadTodaysMood = async () => {
    try {
      const stored = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
      if (stored) {
        const { mood, date } = JSON.parse(stored);
        const today = new Date().toDateString();
        if (date === today) {
          setSelectedMood(mood);
          setShowMessage(true);
        }
      }
    } catch (error) {
      console.error('Error loading mood:', error);
    }
  };

  const saveMood = async (mood: MoodType) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify({ mood, date: today }));
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const handleMoodPress = (mood: MoodType, index: number) => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedMood(mood);
    setShowMessage(true);
    saveMood(mood);
    onMoodSelect?.(mood);
  };

  const selectedMoodData = MOOD_OPTIONS.find(m => m.type === selectedMood);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        How are you feeling today?
      </Text>
      
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((mood, index) => (
          <TouchableOpacity
            key={mood.type}
            onPress={() => handleMoodPress(mood.type, index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.moodButton,
                {
                  backgroundColor: selectedMood === mood.type 
                    ? `${mood.color}30` 
                    : colors.backgroundSecondary,
                  borderColor: selectedMood === mood.type 
                    ? mood.color 
                    : 'transparent',
                  transform: [{ scale: scaleAnims[index] }],
                }
              ]}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            </Animated.View>
            <Text style={[
              styles.moodLabel, 
              { 
                color: selectedMood === mood.type ? mood.color : colors.textTertiary,
                fontFamily: selectedMood === mood.type ? fontFamily.semibold : fontFamily.regular,
              }
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showMessage && selectedMoodData && (
        <Animated.View 
          style={[
            styles.messageContainer, 
            { 
              backgroundColor: `${selectedMoodData.color}15`,
              borderLeftColor: selectedMoodData.color,
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={[styles.messageText, { color: colors.text }]}>
            {selectedMoodData.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  moodButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 26,
  },
  moodLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  messageContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
  },
  messageText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
});

export default MoodSelector;
