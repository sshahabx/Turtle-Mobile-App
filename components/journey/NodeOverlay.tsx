/**
 * NodeOverlay Component
 *
 * Modal overlay showing milestone details including title, achievement date,
 * statistics, and optional reflection text input. Dismisses on outside tap.
 *
 * Requirements:
 * - 5.1: WHEN user taps unlocked Milestone_Node, System SHALL display Node_Overlay
 * - 5.2: Node_Overlay SHALL show milestone title, achievement date, relevant statistics
 * - 5.3: Node_Overlay SHALL include optional short reflection text field
 * - 5.4: WHEN user taps outside Node_Overlay, System SHALL dismiss the overlay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { emerald, zinc } from '../../theme/colors';
import type { Milestone } from '../../types/journey';
import { getMilestoneHint } from '../../features/journey/utils/milestoneUtils';

export interface NodeOverlayProps {
  /** The milestone to display */
  milestone: Milestone;
  /** Whether the overlay is visible */
  visible: boolean;
  /** Whether the milestone is locked */
  isLocked?: boolean;
  /** Callback to close the overlay */
  onClose: () => void;
  /** Callback when reflection text is saved */
  onReflectionSave: (text: string) => void;
}

/**
 * Format date for display
 */
function formatDate(date: Date | undefined): string {
  if (!date) return 'Not yet achieved';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function NodeOverlay({
  milestone,
  visible,
  isLocked = false,
  onClose,
  onReflectionSave,
}: NodeOverlayProps) {
  const { colors, isDark } = useTheme();
  const [reflectionText, setReflectionText] = useState(milestone.reflection || '');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Reset reflection text when opening
      setReflectionText(milestone.reflection || '');
      setHasChanges(false);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, milestone.reflection, fadeAnim, slideAnim]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSaveReflection = () => {
    if (hasChanges) {
      onReflectionSave(reflectionText);
      setHasChanges(false);
    }
    handleClose();
  };

  const handleReflectionChange = (text: string) => {
    setReflectionText(text);
    setHasChanges(text !== (milestone.reflection || ''));
  };

  const hint = isLocked ? getMilestoneHint(milestone.type) : null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Backdrop - tap to dismiss */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={styles.backdrop}
        >
          <Animated.View
            style={[
              styles.backdropOverlay,
              { opacity: fadeAnim },
            ]}
          />
        </TouchableOpacity>

        {/* Overlay content */}
        <Animated.View
          style={[
            styles.overlayContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {milestone.title}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.closeIcon, { color: colors.textMuted }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {milestone.description}
          </Text>

          {isLocked ? (
            /* Locked state - show hint */
            <View
              style={[
                styles.hintContainer,
                { backgroundColor: isDark ? zinc[800] : zinc[100] },
              ]}
            >
              <Text style={[styles.hintLabel, { color: colors.textMuted }]}>
                How to unlock
              </Text>
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                {hint}
              </Text>
            </View>
          ) : (
            /* Unlocked state - show details and reflection */
            <>
              {/* Achievement date */}
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: colors.textMuted }]}>
                  Achieved
                </Text>
                <Text style={[styles.statsValue, { color: colors.text }]}>
                  {formatDate(milestone.unlockedAt)}
                </Text>
              </View>

              {/* Threshold info */}
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: colors.textMuted }]}>
                  Milestone
                </Text>
                <Text style={[styles.statsValue, { color: colors.text }]}>
                  #{milestone.threshold}
                </Text>
              </View>

              {/* Reflection input */}
              <View style={styles.reflectionSection}>
                <Text style={[styles.reflectionLabel, { color: colors.textSecondary }]}>
                  Your reflection (optional)
                </Text>
                <TextInput
                  style={[
                    styles.reflectionInput,
                    {
                      backgroundColor: isDark ? zinc[800] : zinc[50],
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={reflectionText}
                  onChangeText={handleReflectionChange}
                  placeholder="How did this moment feel?"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={280}
                />
                <Text style={[styles.charCount, { color: colors.textMuted }]}>
                  {reflectionText.length}/280
                </Text>
              </View>

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSaveReflection}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: hasChanges
                      ? isDark
                        ? emerald[600]
                        : emerald[500]
                      : isDark
                      ? zinc[700]
                      : zinc[200],
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color: hasChanges
                        ? '#ffffff'
                        : isDark
                        ? zinc[400]
                        : zinc[500],
                    },
                  ]}
                >
                  {hasChanges ? 'Save & Close' : 'Close'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContainer: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeIcon: {
    fontSize: fontSize.lg,
    fontWeight: '300',
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    marginBottom: spacing.lg,
  },
  hintContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  hintLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  hintText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  statsLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  statsValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  reflectionSection: {
    marginTop: spacing.lg,
  },
  reflectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    marginBottom: spacing.sm,
  },
  reflectionInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    minHeight: 80,
  },
  charCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
  },
});

export default NodeOverlay;
