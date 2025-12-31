import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { semanticColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

/**
 * Option type for dropdown items
 */
export interface DropdownOption {
  value: string;
  label: string;
  icon?: string; // Optional emoji or icon
}

/**
 * Props for the DropdownSelector component
 */
export interface DropdownSelectorProps {
  label?: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  testID?: string;
}

/**
 * A reusable dropdown selector component for consistent selection UI.
 * 
 * Requirements:
 * - 6.1: Accept a list of options with value and label properties
 * - 6.2: Display the currently selected option
 * - 6.3: Display all available options when tapped
 * - 6.4: Close and update selected value when an option is selected
 * - 6.5: Support optional placeholder text when no value is selected
 * - 6.6: Apply consistent styling from the theme system
 */
export function DropdownSelector({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  testID,
}: DropdownSelectorProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const hasError = !!error;

  // Find the selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const hasValue = !!selectedOption;

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      setIsOpen(false);
    },
    [onChange]
  );

  const renderOption = useCallback(
    ({ item }: { item: DropdownOption }) => {
      const isSelected = item.value === value;
      return (
        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: isSelected ? colors.backgroundTertiary : 'transparent',
            },
          ]}
          onPress={() => handleSelect(item.value)}
          activeOpacity={0.7}
          testID={testID ? `${testID}-option-${item.value}` : undefined}
        >
          {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
          <Text
            style={[
              styles.optionText,
              {
                color: isSelected ? colors.primary : colors.text,
                fontFamily: isSelected ? fontFamily.medium : fontFamily.regular,
              },
            ]}
          >
            {item.label}
          </Text>
          {isSelected && (
            <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
          )}
        </TouchableOpacity>
      );
    },
    [value, colors, handleSelect, testID]
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: hasError ? semanticColors.error : colors.border,
          },
        ]}
        onPress={handleOpen}
        activeOpacity={0.7}
        testID={testID}
      >
        {selectedOption?.icon && (
          <Text style={styles.triggerIcon}>{selectedOption.icon}</Text>
        )}
        <Text
          style={[
            styles.triggerText,
            {
              color: hasValue ? colors.text : colors.textTertiary,
            },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>

      {hasError && (
        <Text style={[styles.errorText, { color: semanticColors.error }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </View>
        </Pressable>
      </Modal>
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
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: componentBorderRadius.input,
  },
  triggerIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  chevron: {
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dropdown: {
    width: '100%',
    maxHeight: 300,
    borderWidth: 1,
    borderRadius: componentBorderRadius.dropdown,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  optionText: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  checkmark: {
    fontSize: fontSize.base,
    marginLeft: spacing.sm,
  },
});

export default DropdownSelector;
