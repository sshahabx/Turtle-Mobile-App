/**
 * JobForm Component
 * 
 * Form for creating and editing job applications with validation.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 4.5: Apply consistent input styling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Job, JobStatus, JobCreateInput } from '../../types';
import { validateJobInput, ValidationError } from '../../utils/validation';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: JobStatus.PENDING, label: 'Pending' },
  { value: JobStatus.APPLIED, label: 'Applied' },
  { value: JobStatus.INTERVIEWING, label: 'Interviewing' },
  { value: JobStatus.OFFERED, label: 'Offered' },
  { value: JobStatus.ACCEPTED, label: 'Accepted' },
  { value: JobStatus.REJECTED, label: 'Rejected' },
];

export interface JobFormData {
  title: string;
  company: string;
  status: JobStatus;
  platform: string;
  deadline: Date | null;
  notes: string;
}

export interface JobFormProps {
  initialValues?: Partial<Job>;
  onSubmit: (data: JobCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function JobForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: JobFormProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<JobFormData>({
    title: initialValues?.title ?? '',
    company: initialValues?.company ?? '',
    status: initialValues?.status ?? JobStatus.PENDING,
    platform: initialValues?.platform ?? '',
    deadline: initialValues?.deadline ?? null,
    notes: initialValues?.notes ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title ?? '',
        company: initialValues.company ?? '',
        status: initialValues.status ?? JobStatus.PENDING,
        platform: initialValues.platform ?? '',
        deadline: initialValues.deadline ?? null,
        notes: initialValues.notes ?? '',
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof JobFormData, value: string | JobStatus | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    const validation = validateJobInput({
      title: formData.title,
      company: formData.company,
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err: ValidationError) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const submitData: JobCreateInput = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      status: formData.status,
      platform: formData.platform.trim() || undefined,
      deadline: formData.deadline || undefined,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <ScrollView 
      style={[styles.scrollView, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Input
          label="Job Title *"
          placeholder="e.g., Software Engineer"
          value={formData.title}
          onChangeText={(text) => handleChange('title', text)}
          error={errors.title}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Input
          label="Company *"
          placeholder="e.g., Google"
          value={formData.company}
          onChangeText={(text) => handleChange('company', text)}
          error={errors.company}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Status</Text>
          <TouchableOpacity
            onPress={() => setShowStatusPicker(!showStatusPicker)}
            style={[styles.selectButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>
              {STATUS_OPTIONS.find((s) => s.value === formData.status)?.label}
            </Text>
            <Text style={[styles.selectArrow, { color: colors.textTertiary }]}>▼</Text>
          </TouchableOpacity>
          
          {showStatusPicker && (
            <View style={[styles.optionsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    handleChange('status', option.value);
                    setShowStatusPicker(false);
                  }}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.border },
                    formData.status === option.value && { backgroundColor: colors.backgroundSecondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text },
                      formData.status === option.value && { color: colors.primary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Input
          label="Platform"
          placeholder="e.g., LinkedIn, Indeed"
          value={formData.platform}
          onChangeText={(text) => handleChange('platform', text)}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <DatePicker
          label="Deadline"
          value={formData.deadline}
          onChange={(date) => handleChange('deadline', date)}
          placeholder="Select deadline"
          minimumDate={new Date()}
        />

        <TextArea
          label="Notes"
          placeholder="Add any notes about this application..."
          value={formData.notes}
          onChangeText={(text) => handleChange('notes', text)}
          rows={4}
        />

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
  selectButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  selectArrow: {
    fontFamily: fontFamily.regular,
  },
  optionsList: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  optionText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
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

export default JobForm;
