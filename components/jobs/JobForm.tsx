/**
 * JobForm Component
 * 
 * Form for creating and editing job applications with validation.
 * Uses centralized theme system for consistent styling.
 * Uses 2-column grid layout for compact form display.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 4.5: Apply consistent input styling
 * - 1.1, 1.2, 1.3, 1.4: Platform selection dropdown with custom platform support
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
import { PlatformSelector } from './PlatformSelector';
import { getPlatformSelection, getFinalPlatformValue } from '../../features/jobs/utils/platformUtils';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';

const STATUS_OPTIONS: { value: JobStatus; label: string; color: string }[] = [
  { value: JobStatus.PENDING, label: 'Pending', color: statusColors.pending },
  { value: JobStatus.APPLIED, label: 'Applied', color: statusColors.applied },
  { value: JobStatus.INTERVIEWING, label: 'Interviewing', color: statusColors.interviewing },
  { value: JobStatus.OFFERED, label: 'Offered', color: statusColors.offered },
  { value: JobStatus.ACCEPTED, label: 'Accepted', color: statusColors.accepted },
  { value: JobStatus.REJECTED, label: 'Rejected', color: statusColors.rejected },
];

export interface JobFormData {
  title: string;
  company: string;
  status: JobStatus;
  platform: string;
  customPlatform: string;
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
  
  // Initialize platform selection from existing job data
  const initialPlatformSelection = getPlatformSelection(initialValues?.platform ?? '');
  
  const [formData, setFormData] = useState<JobFormData>({
    title: initialValues?.title ?? '',
    company: initialValues?.company ?? '',
    status: initialValues?.status ?? JobStatus.PENDING,
    platform: initialPlatformSelection.selected,
    customPlatform: initialPlatformSelection.custom,
    deadline: initialValues?.deadline ?? null,
    notes: initialValues?.notes ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    if (initialValues) {
      const platformSelection = getPlatformSelection(initialValues.platform ?? '');
      setFormData({
        title: initialValues.title ?? '',
        company: initialValues.company ?? '',
        status: initialValues.status ?? JobStatus.PENDING,
        platform: platformSelection.selected,
        customPlatform: platformSelection.custom,
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

    // Get the final platform value based on selection
    const finalPlatform = getFinalPlatformValue(formData.platform, formData.customPlatform);

    const submitData: JobCreateInput = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      status: formData.status,
      platform: finalPlatform || undefined,
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
        {/* Row 1: Job Title and Company */}
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <Input
              label="Job Title *"
              placeholder="e.g., Software Engineer"
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              error={errors.title}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
          <View style={styles.halfColumn}>
            <Input
              label="Company *"
              placeholder="e.g., Google"
              value={formData.company}
              onChangeText={(text) => handleChange('company', text)}
              error={errors.company}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Row 2: Status and Platform */}
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <TouchableOpacity
                onPress={() => setShowStatusPicker(!showStatusPicker)}
                style={[styles.selectButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.statusDisplay}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_OPTIONS.find((s) => s.value === formData.status)?.color }]} />
                  <Text style={[styles.selectText, { color: colors.text }]}>
                    {STATUS_OPTIONS.find((s) => s.value === formData.status)?.label}
                  </Text>
                </View>
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
                      <View style={styles.statusDisplay}>
                        <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            formData.status === option.value && { color: colors.primary },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          <View style={styles.halfColumn}>
            <PlatformSelector
              value={formData.platform}
              customPlatform={formData.customPlatform}
              onPlatformChange={(platform) => handleChange('platform', platform)}
              onCustomPlatformChange={(custom) => handleChange('customPlatform', custom)}
            />
          </View>
        </View>

        {/* Row 3: Deadline (full width) */}
        <DatePicker
          label="Deadline"
          value={formData.deadline}
          onChange={(date) => handleChange('deadline', date)}
          placeholder="Select deadline"
          minimumDate={new Date()}
        />

        {/* Row 4: Notes (full width) */}
        <TextArea
          label="Notes"
          placeholder="Add any notes about this application..."
          value={formData.notes}
          onChangeText={(text) => handleChange('notes', text)}
          rows={3}
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
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  halfColumn: {
    flex: 1,
    paddingHorizontal: spacing.xs,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
