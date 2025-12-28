/**
 * NoteForm Component
 * 
 * Form for creating and editing notes with validation.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 4.5: Apply consistent input styling
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Note, NoteCreateInput } from '../../types';
import { validateNoteInput, ValidationError } from '../../utils/validation';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { spacing } from '../../theme';

export interface NoteFormData {
  title: string;
  content: string;
}

export interface NoteFormProps {
  initialValues?: Partial<Note>;
  onSubmit: (data: NoteCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function NoteForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: NoteFormProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: initialValues?.title ?? '',
    content: initialValues?.content ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title ?? '',
        content: initialValues.content ?? '',
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof NoteFormData, value: string) => {
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
    const validation = validateNoteInput({
      title: formData.title,
      content: formData.content,
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err: ValidationError) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const submitData: NoteCreateInput = {
      title: formData.title.trim(),
      content: formData.content.trim(),
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
          placeholder="Enter note title"
          value={formData.title}
          onChangeText={(text) => handleChange('title', text)}
          error={errors.title}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <TextArea
          label="Content *"
          placeholder="Write your note here..."
          value={formData.content}
          onChangeText={(text) => handleChange('content', text)}
          error={errors.content}
          rows={8}
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

export default NoteForm;
