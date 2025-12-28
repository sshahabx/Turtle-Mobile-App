/**
 * OfferDetailsForm Component
 * 
 * Form for entering offer details when accepting a job.
 * 
 * Requirements:
 * - 5.3: Form for salary, benefits, accepted date
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export interface OfferDetailsData {
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
}

export function OfferDetailsForm({
  onSubmit,
  onCancel,
  isLoading = false,
  jobTitle,
  companyName,
}: OfferDetailsFormProps) {
  const [salary, setSalary] = useState('');
  const [benefits, setBenefits] = useState('');
  const [acceptedDate, setAcceptedDate] = useState<Date>(new Date());
  const { colors, isDark } = useTheme();

  const handleSubmit = () => {
    onSubmit({
      offerSalary: salary.trim(),
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
          {jobTitle && companyName && (
            <Text style={[styles.congratsSubtitle, { color: isDark ? '#4ade80' : '#15803d' }]}>
              You're accepting the offer for {jobTitle} at {companyName}
            </Text>
          )}
        </View>

        {/* Salary */}
        <Input
          label="Salary"
          placeholder="e.g., $120,000/year"
          value={salary}
          onChangeText={setSalary}
          keyboardType="default"
          autoCapitalize="none"
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
