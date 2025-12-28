import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { semanticColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { colors } = useTheme();
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: hasError ? semanticColors.error : colors.border,
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {hasError && (
        <Text style={[styles.errorText, { color: semanticColors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg, // 16px
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    marginBottom: spacing.xs, // 4px
  },
  input: {
    paddingHorizontal: spacing.lg, // 16px
    paddingVertical: spacing.md, // 12px
    borderWidth: 1,
    borderRadius: componentBorderRadius.input, // 8px as per requirements
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs, // 4px
  },
});

export default Input;
