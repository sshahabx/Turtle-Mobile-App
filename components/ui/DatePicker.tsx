/**
 * DatePicker Component
 * 
 * Simple date picker using text input with date formatting.
 * Supports dark mode theming.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { formatDate } from '../../utils/date';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { fontFamily, fontSize, spacing } from '../../theme';

export interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
}

const generateYears = (min: number, max: number): number[] => {
  const years: number[] = [];
  for (let i = max; i >= min; i--) {
    years.push(i);
  }
  return years;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  clearable = true,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { colors, isDark } = useTheme();
  
  const currentDate = value || new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const minYear = minimumDate?.getFullYear() || new Date().getFullYear() - 10;
  const maxYear = maximumDate?.getFullYear() || new Date().getFullYear() + 10;
  const years = generateYears(minYear, maxYear);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(null);
    setShowPicker(false);
  };

  const handleOpen = () => {
    const date = value || new Date();
    setSelectedYear(date.getFullYear());
    setSelectedMonth(date.getMonth());
    setSelectedDay(date.getDate());
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <View style={styles.inputRow}>
        <TouchableOpacity
          onPress={handleOpen}
          style={[styles.inputButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={value ? [styles.inputText, { color: colors.text }] : [styles.placeholderText, { color: colors.textTertiary }]}>
            {value ? formatDate(value) : placeholder}
          </Text>
          <Text style={[styles.calendarIcon, { color: colors.textTertiary }]}>📅</Text>
        </TouchableOpacity>
        
        {clearable && value && (
          <TouchableOpacity
            onPress={() => onChange(null)}
            style={[styles.clearButton, { backgroundColor: colors.backgroundTertiary }]}
          >
            <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContent}>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setSelectedMonth(index)}
                    style={[
                      styles.pickerItem,
                      selectedMonth === index && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: colors.text },
                        selectedMonth === index && { color: colors.primary, fontFamily: fontFamily.semibold },
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.pickerItem,
                      selectedDay === day && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: colors.text },
                        selectedDay === day && { color: colors.primary, fontFamily: fontFamily.semibold },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    style={[
                      styles.pickerItem,
                      selectedYear === year && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: colors.text },
                        selectedYear === year && { color: colors.primary, fontFamily: fontFamily.semibold },
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {clearable && (
              <View style={styles.clearButtonContainer}>
                <Button variant="ghost" onPress={handleClear}>
                  Clear Date
                </Button>
              </View>
            )}

            <View style={styles.bottomSafeArea} />
          </View>
        </View>
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
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputButton: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  placeholderText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  calendarIcon: {},
  clearButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  clearIcon: {},
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  modalTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
  },
  doneText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  pickerContent: {
    flexDirection: 'row',
    height: 192,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pickerItemText: {
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    fontSize: fontSize.base,
  },
  clearButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomSafeArea: {
    height: 32,
  },
});

export default DatePicker;
