/**
 * PersonalHeader Component
 * 
 * A personal, journal-like header for the notes screen.
 * Shows greeting based on time of day, date, and inspirational prompts.
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

const WRITING_PROMPTS = [
  "What's on your mind today?",
  "Capture a thought worth remembering...",
  "What made you smile today?",
  "Write something you're grateful for...",
  "What's your biggest win this week?",
  "Jot down an idea before it slips away...",
  "What lesson did you learn recently?",
  "Describe your perfect day...",
  "What are you looking forward to?",
  "Write a note to your future self...",
];

function getGreeting(): { greeting: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', icon: 'sunny', iconColor: '#FFB347' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', icon: 'sunny', iconColor: '#FFD700' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', icon: 'partly-sunny', iconColor: '#FF8C42' };
  } else {
    return { greeting: 'Good night', icon: 'moon', iconColor: '#5C6BC0' };
  }
}

function formatDate(): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('en-US', options);
}

export interface PersonalHeaderProps {
  notesCount: number;
  onPress?: () => void;
}

export const PersonalHeader = memo(function PersonalHeader({ notesCount, onPress }: PersonalHeaderProps) {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { greeting, icon, iconColor } = getGreeting();
  const date = formatDate();

  useEffect(() => {
    // Select random prompt
    const randomPrompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    setPrompt(randomPrompt);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Container 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Decorative corner */}
        <View style={[styles.cornerDecoration, { backgroundColor: colors.primary }]} />
        
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
          <View style={styles.greetingText}>
            <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{date}</Text>
          </View>
        </View>

        {/* Divider with pen icon */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.penIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="pencil" size={14} color={colors.textTertiary} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* Writing Prompt */}
        <Text style={[styles.prompt, { color: colors.textSecondary }]}>
          "{prompt}"
        </Text>

        {/* Notes Count */}
        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="document-text" size={16} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.primary }]}>{notesCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {notesCount === 1 ? 'note' : 'notes'} in your journal
            </Text>
          </View>
        </View>
      </Container>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cornerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderBottomLeftRadius: 60,
    opacity: 0.1,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  penIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  prompt: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  statsRow: {
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    marginRight: spacing.xs,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});

export default PersonalHeader;
