import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DropdownSelector } from '../ui/DropdownSelector';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import {
  Currency,
  CURRENCY_OPTIONS,
  SALARY_RANGES,
  isValidCurrency,
} from '../../features/jobs/utils/salaryUtils';

/**
 * Props for the SalarySelector component
 */
export interface SalarySelectorProps {
  /** Currently selected currency */
  currency: Currency | null;
  /** Currently selected salary range */
  salaryRange: string | null;
  /** Callback when currency changes */
  onCurrencyChange: (currency: Currency) => void;
  /** Callback when salary range changes */
  onSalaryRangeChange: (range: string) => void;
  /** Optional label for the component */
  label?: string;
  /** Optional error message */
  error?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * SalarySelector Component
 * 
 * A compound component that combines currency selection and salary range selection.
 * The salary ranges update dynamically based on the selected currency.
 * 
 * Requirements:
 * - 2.1: Currency_Selector SHALL provide options for USD, PKR, and GBP with flag emojis
 * - 2.2: Salary_Range_Selector SHALL display ranges appropriate for selected currency
 * 
 * Property 3: Currency-Specific Salary Ranges
 * - For any currency selection, the Salary_Range_Selector SHALL display
 *   only the salary ranges defined for that specific currency
 */
export function SalarySelector({
  currency,
  salaryRange,
  onCurrencyChange,
  onSalaryRangeChange,
  label,
  error,
  testID,
}: SalarySelectorProps) {
  const { colors } = useTheme();

  // Get salary ranges for the currently selected currency
  const salaryRangeOptions = currency ? SALARY_RANGES[currency] : [];

  // Reset salary range when currency changes and current range is not valid for new currency
  useEffect(() => {
    if (currency && salaryRange) {
      const validRanges = SALARY_RANGES[currency].map((r) => r.value);
      if (!validRanges.includes(salaryRange)) {
        // Clear the salary range if it's not valid for the new currency
        onSalaryRangeChange('');
      }
    }
  }, [currency, salaryRange, onSalaryRangeChange]);

  const handleCurrencyChange = useCallback(
    (value: string) => {
      if (isValidCurrency(value)) {
        onCurrencyChange(value);
      }
    },
    [onCurrencyChange]
  );

  const handleSalaryRangeChange = useCallback(
    (value: string) => {
      onSalaryRangeChange(value);
    },
    [onSalaryRangeChange]
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <View style={styles.selectorsRow}>
        {/* Currency Selector */}
        <View style={styles.currencyContainer}>
          <DropdownSelector
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={handleCurrencyChange}
            placeholder="Select"
            testID={testID ? `${testID}-currency` : 'salary-currency-selector'}
          />
        </View>

        {/* Salary Range Selector */}
        <View style={styles.rangeContainer}>
          <DropdownSelector
            label="Salary Range"
            options={salaryRangeOptions}
            value={salaryRange}
            onChange={handleSalaryRangeChange}
            placeholder={currency ? 'Select range' : 'Select currency first'}
            error={error}
            testID={testID ? `${testID}-range` : 'salary-range-selector'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    marginBottom: spacing.sm,
  },
  selectorsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  currencyContainer: {
    flex: 1,
    maxWidth: 120,
  },
  rangeContainer: {
    flex: 2,
  },
});

export default SalarySelector;
