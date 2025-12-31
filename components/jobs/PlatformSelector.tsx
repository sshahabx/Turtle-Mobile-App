/**
 * PlatformSelector Component
 * 
 * A compound component with inline dropdown for platform selection
 * and conditionally renders a custom platform input when "Others" is selected.
 * Uses Ionicons for platform icons.
 * 
 * Requirements:
 * - 1.1: Display predefined platform options with icons
 * - 1.2: When "Others" is selected, display a text input for custom platform name
 * - 1.3: When a predefined platform is selected, hide the custom platform input
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

// Platform options with icons
const PLATFORM_OPTIONS = [
  { value: 'LinkedIn', label: 'LinkedIn', icon: 'logo-linkedin' as const },
  { value: 'Indeed', label: 'Indeed', icon: 'briefcase-outline' as const },
  { value: 'Glassdoor', label: 'Glassdoor', icon: 'business-outline' as const },
  { value: 'Company Website', label: 'Company Website', icon: 'globe-outline' as const },
  { value: 'Referral', label: 'Referral', icon: 'people-outline' as const },
  { value: 'Others', label: 'Others', icon: 'ellipsis-horizontal-outline' as const },
];

// Platform colors for visual distinction
const PLATFORM_COLORS: Record<string, string> = {
  'LinkedIn': '#0A66C2',
  'Indeed': '#2164f3',
  'Glassdoor': '#0CAA41',
  'Company Website': '#6366f1',
  'Referral': '#f59e0b',
  'Others': '#6b7280',
};

export interface PlatformSelectorProps {
  value: string;
  customPlatform: string;
  onPlatformChange: (platform: string) => void;
  onCustomPlatformChange: (custom: string) => void;
  error?: string;
  customPlatformError?: string;
  testID?: string;
}

export function PlatformSelector({
  value,
  customPlatform,
  onPlatformChange,
  onCustomPlatformChange,
  error,
  customPlatformError,
  testID,
}: PlatformSelectorProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  
  const showCustomInput = value === 'Others';
  const selectedOption = PLATFORM_OPTIONS.find(p => p.value === value);
  const selectedColor = value ? PLATFORM_COLORS[value] || colors.primary : colors.textTertiary;

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Platform</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(!showPicker)}
          style={[styles.selectButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          testID={testID}
        >
          <View style={styles.platformDisplay}>
            {selectedOption ? (
              <>
                <Ionicons name={selectedOption.icon} size={18} color={selectedColor} style={styles.platformIcon} />
                <Text style={[styles.selectText, { color: colors.text }]}>
                  {selectedOption.label}
                </Text>
              </>
            ) : (
              <Text style={[styles.selectText, { color: colors.textTertiary }]}>
                Select platform
              </Text>
            )}
          </View>
          <Text style={[styles.selectArrow, { color: colors.textTertiary }]}>▼</Text>
        </TouchableOpacity>
        
        {showPicker && (
          <View style={[styles.optionsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {PLATFORM_OPTIONS.map((option) => {
              const optionColor = PLATFORM_COLORS[option.value] || colors.primary;
              const isSelected = value === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onPlatformChange(option.value);
                    setShowPicker(false);
                  }}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: colors.backgroundSecondary },
                  ]}
                >
                  <View style={styles.platformDisplay}>
                    <Ionicons name={option.icon} size={18} color={optionColor} style={styles.platformIcon} />
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        isSelected && { color: colors.primary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        {error && (
          <Text style={[styles.errorText, { color: colors.error || '#ef4444' }]}>{error}</Text>
        )}
      </View>
      
      {showCustomInput && (
        <Input
          label="Custom Platform"
          value={customPlatform}
          onChangeText={onCustomPlatformChange}
          placeholder="Enter platform name"
          error={customPlatformError}
          testID={testID ? `${testID}-custom-input` : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs + 2,
  },
  selectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    marginRight: spacing.sm,
  },
  selectText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  selectArrow: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  optionsList: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  optionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

export default PlatformSelector;
