/**
 * TaskForm Component
 * 
 * Form for creating and editing tasks with validation.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 4.5: Apply consistent input styling
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Task, TaskCreateInput } from '../../types';
import { validateTaskInput, ValidationError } from '../../utils/validation';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { DatePicker } from '../ui/DatePicker';
import { Button } from '../ui/Button';
import { spacing } from '../../theme';

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: Date | null;
}

export interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (data: TaskCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    dueDate: initialValues?.dueDate ?? null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        dueDate: initialValues.dueDate ?? null,
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof TaskFormData, value: string | Date | null) => {
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
    const validation = validateTaskInput({
      title: formData.title,
      description: formData.description || undefined,
      dueDate: formData.dueDate || undefined,
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err: ValidationError) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const submitData: TaskCreateInput = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formData.dueDate || undefined,
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
          label="Title *"
          placeholder="Enter task title"
          value={formData.title}
          onChangeText={(text) => handleChange('title', text)}
          error={errors.title}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <TextArea
          label="Description"
          placeholder="Add more details about this task..."
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          error={errors.description}
          rows={4}
        />

        <DatePicker
          label="Due Date"
          value={formData.dueDate}
          onChange={(date) => handleChange('dueDate', date)}
          placeholder="Select due date (optional)"
          clearable
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default TaskForm;
