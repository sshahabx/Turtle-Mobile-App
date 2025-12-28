/**
 * HabitForm Component
 * 
 * Form for creating and editing habits with validation.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 4.5: Apply consistent input styling
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Habit, HabitCreateInput } from '../../types';
import { validateHabitInput, ValidationError } from '../../utils/validation';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export interface HabitFormData {
  name: string;
  description: string;
  targetDays: number;
}

export interface HabitFormProps {
  initialValues?: Partial<Habit>;
  onSubmit: (data: HabitCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const DEFAULT_TARGET_DAYS = 7;

export function HabitForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: HabitFormProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<HabitFormData>({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    targetDays: initialValues?.targetDays ?? DEFAULT_TARGET_DAYS,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name ?? '',
        description: initialValues.description ?? '',
        targetDays: initialValues.targetDays ?? DEFAULT_TARGET_DAYS,
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof HabitFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTargetDaysChange = (text: string) => {
    const numValue = parseInt(text, 10);
    if (text === '' || isNaN(numValue)) {
      handleChange('targetDays', DEFAULT_TARGET_DAYS);
    } else {
      handleChange('targetDays', Math.max(1, Math.min(365, numValue)));
    }
  };

  const handleSubmit = () => {
    const validation = validateHabitInput({
      name: formData.name,
      description: formData.description || undefined,
      targetDays: formData.targetDays,
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err: ValidationError) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const submitData: HabitCreateInput = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      targetDays: formData.targetDays,
    };

    onSubmit(submitData);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Input
          label="Name *"
          placeholder="Enter habit name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          error={errors.name}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <TextArea
          label="Description"
          placeholder="Add more details about this habit..."
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          rows={3}
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Target Days</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Number of consecutive days to complete this habit
          </Text>
          <Input
            placeholder="7"
            value={formData.targetDays.toString()}
            onChangeText={handleTargetDaysChange}
            error={errors.targetDays}
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>

        <View style={styles.presetContainer}>
          {[7, 14, 21, 30, 60, 90].map((days) => (
            <View key={days} style={styles.presetButtonWrapper}>
              <Button
                variant={formData.targetDays === days ? 'primary' : 'outline'}
                onPress={() => handleChange('targetDays', days)}
              >
                {days} days
              </Button>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button
              variant="outline"
              onPress={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              onPress={handleSubmit}
              loading={isLoading}
            >
              {submitLabel}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs + 2,
  },
  helperText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
    gap: spacing.sm,
  },
  presetButtonWrapper: {
    marginBottom: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default HabitForm;
