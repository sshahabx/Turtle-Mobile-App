import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { semanticColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface TextAreaProps extends Omit<TextInputProps, 'multiline'> {
  label?: string;
  error?: string;
  rows?: number;
}

export function TextArea({
  label,
  error,
  rows = 4,
  style,
  ...props
}: TextAreaProps) {
  const { colors } = useTheme();
  const hasError = !!error;
  const minHeight = rows * 24;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          { 
            minHeight,
            backgroundColor: colors.surface,
            borderColor: hasError ? semanticColors.error : colors.border,
            color: colors.text,
          },
          style,
        ]}
        multiline
        placeholderTextColor={colors.textTertiary}
        textAlignVertical="top"
        {...props}
      />
      {hasError && (
        <Text style={[styles.errorText, { color: semanticColors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    marginBottom: spacing.xs + 2,
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: componentBorderRadius.input,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

export default TextArea;
