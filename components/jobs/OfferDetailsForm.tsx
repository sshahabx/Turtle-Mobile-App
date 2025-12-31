/**
 * OfferDetailsForm Component
 * 
 * Form for entering offer details when accepting a job.
 * 
 * Requirements:
 * - 5.1: Display job title and company as editable fields pre-populated from the job
 * - 5.2: Include Currency_Selector and Salary_Range_Selector for salary input
 * - 5.3: Form for salary, benefits, accepted date
 * - 5.5: Parse and pre-select currency from stored salary string
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { SalarySelector } from './SalarySelector';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';
import {
  Currency,
  parseSalaryString,
  formatSalary,
} from '../../features/jobs/utils/salaryUtils';

export interface OfferDetailsData {
  offerTitle: string;
  offerCompany: string;
  offerSalary: string;
  offerBenefits: string;
  offerAcceptedDate: Date;
}

export interface OfferDetailsFormProps {
  onSubmit: (data: OfferDetailsData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  jobTitle?: string;
  companyName?: string;
  /** Existing salary string for pre-population (Requirements: 5.5) */
  existingSalary?: string;
  /** Existing benefits string for pre-population */
  existingBenefits?: string;
  /** Hide job title and company fields (used when changing status from job details) */
  hideJobInfo?: boolean;
}

export function OfferDetailsForm({
  onSubmit,
  onCancel,
  isLoading = false,
  jobTitle,
  companyName,
  existingSalary,
  existingBenefits,
  hideJobInfo = false,
}: OfferDetailsFormProps) {
  // Editable job title and company fields (Requirements: 5.1)
  const [offerTitle, setOfferTitle] = useState(jobTitle || '');
  const [offerCompany, setOfferCompany] = useState(companyName || '');
  
  // Currency and salary range state (Requirements: 5.2, 5.5)
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [salaryRange, setSalaryRange] = useState<string | null>(null);
  
  const [benefits, setBenefits] = useState(existingBenefits || '');
  const [acceptedDate, setAcceptedDate] = useState<Date>(new Date());
  const { colors, isDark } = useTheme();

  // Initialize currency and salary range from existing salary string (Requirements: 5.5)
  useEffect(() => {
    if (existingSalary) {
      const parsed = parseSalaryString(existingSalary);
      if (parsed.currency) {
        setCurrency(parsed.currency);
      }
      if (parsed.range) {
        setSalaryRange(parsed.range);
      }
    }
  }, [existingSalary]);

  // Update title and company when props change
  useEffect(() => {
    if (jobTitle) {
      setOfferTitle(jobTitle);
    }
  }, [jobTitle]);

  useEffect(() => {
    if (companyName) {
      setOfferCompany(companyName);
    }
  }, [companyName]);

  // Update benefits when prop changes
  useEffect(() => {
    if (existingBenefits) {
      setBenefits(existingBenefits);
    }
  }, [existingBenefits]);

  const handleSubmit = () => {
    // Format salary from currency and range selection (Requirements: 2.6)
    const formattedSalary = currency && salaryRange 
      ? formatSalary(currency, salaryRange) 
      : '';

    onSubmit({
      offerTitle: offerTitle.trim(),
      offerCompany: offerCompany.trim(),
      offerSalary: formattedSalary,
      offerBenefits: benefits.trim(),
      offerAcceptedDate: acceptedDate,
    });
  };

  return (
    <ScrollView 
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Congratulations Header */}
        <View style={[styles.congratsCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4' }]}>
          <View style={[styles.congratsIcon, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7' }]}>
            <View style={[styles.congratsCheck, { borderColor: isDark ? '#86efac' : '#166534' }]} />
          </View>
          <Text style={[styles.congratsTitle, { color: isDark ? '#86efac' : '#166534' }]}>
            Congratulations!
          </Text>
          {offerTitle && offerCompany && (
            <Text style={[styles.congratsSubtitle, { color: isDark ? '#4ade80' : '#15803d' }]}>
              You're accepting the offer for {offerTitle} at {offerCompany}
            </Text>
          )}
        </View>

        {/* Job Title - Editable field pre-populated from props (Requirements: 5.1) */}
        {!hideJobInfo && (
          <Input
            label="Job Title"
            placeholder="e.g., Software Engineer"
            value={offerTitle}
            onChangeText={setOfferTitle}
            autoCapitalize="words"
          />
        )}

        {/* Company Name - Editable field pre-populated from props (Requirements: 5.1) */}
        {!hideJobInfo && (
          <Input
            label="Company"
            placeholder="e.g., Acme Corp"
            value={offerCompany}
            onChangeText={setOfferCompany}
            autoCapitalize="words"
          />
        )}

        {/* Salary - Currency and Range Selectors (Requirements: 5.2) */}
        <SalarySelector
          label="Salary"
          currency={currency}
          salaryRange={salaryRange}
          onCurrencyChange={setCurrency}
          onSalaryRangeChange={setSalaryRange}
          testID="offer-salary"
        />

        {/* Benefits */}
        <TextArea
          label="Benefits"
          placeholder="e.g., Health insurance, 401k match, unlimited PTO..."
          value={benefits}
          onChangeText={setBenefits}
          rows={3}
        />

        {/* Accepted Date */}
        <DatePicker
          label="Accepted Date"
          value={acceptedDate}
          onChange={(date) => date && setAcceptedDate(date)}
          maximumDate={new Date()}
          clearable={false}
        />

        {/* Info Text */}
        <Text style={[styles.infoText, { color: colors.textTertiary }]}>
          These details are optional but help you keep track of your offer.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button variant="outline" onPress={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button onPress={handleSubmit} loading={isLoading}>
              Accept Offer
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
  content: {
    padding: spacing.lg,
  },
  congratsCard: {
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  congratsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  congratsCheck: {
    width: 16,
    height: 10,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    transform: [{ rotate: '-45deg' }],
    marginTop: -4,
  },
  congratsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  infoText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default OfferDetailsForm;
