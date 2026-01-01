/**
 * NotificationPreferences Component
 *
 * Provides UI for configuring notification preferences including:
 * - Master toggle for all notifications
 * - Individual toggles for each notification type
 * - Time picker for habit reminder time
 *
 * Requirements:
 * - 3.1: Display "Notifications" settings section
 * - 3.2: Include toggles for each notification type
 * - 3.3: Persist preference changes immediately
 * - 3.4: Include master toggle to enable/disable all notifications
 * - 3.5: When master toggle is disabled, no notifications are delivered
 * - 3.6: Preferences persist across app restarts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { useNotificationStore } from '../../store/notificationStore';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

interface PreferenceRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function PreferenceRow({
  icon,
  iconColor,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: PreferenceRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.preferenceRow, disabled && styles.disabledRow]}>
      <View style={styles.preferenceLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.preferenceLabel,
              { color: disabled ? colors.textTertiary : colors.text },
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text style={[styles.preferenceDescription, { color: colors.textTertiary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={Platform.OS === 'android' ? (value ? colors.primary : colors.textTertiary) : '#fff'}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

interface TimePickerRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

function TimePickerRow({
  icon,
  iconColor,
  label,
  value,
  onValueChange,
  disabled = false,
}: TimePickerRowProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  // Parse HH:mm string to Date
  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date to HH:mm string
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format for display (12-hour format)
  const formatDisplayTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onValueChange(formatTime(selectedDate));
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.preferenceRow, disabled && styles.disabledRow]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <View style={styles.preferenceLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <Text
            style={[
              styles.preferenceLabel,
              { color: disabled ? colors.textTertiary : colors.text },
            ]}
          >
            {label}
          </Text>
        </View>
        <View style={styles.timeValueContainer}>
          <Text
            style={[
              styles.timeValue,
              { color: disabled ? colors.textTertiary : colors.textSecondary },
            ]}
          >
            {formatDisplayTime(value)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.pickerButton, { color: colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>
                  Reminder Time
                </Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.pickerButton, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={parseTime(value)}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={parseTime(value)}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}
    </>
  );
}

export function NotificationPreferences() {
  const { colors } = useTheme();
  const { preferences, updatePreferences } = useNotificationStore();

  const handleMasterToggle = (enabled: boolean) => {
    updatePreferences({ enabled });
  };

  const handlePreferenceChange = (
    key: keyof typeof preferences,
    value: boolean | string
  ) => {
    updatePreferences({ [key]: value });
  };

  const isMasterEnabled = preferences.enabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Master Toggle */}
      <PreferenceRow
        icon="notifications"
        iconColor={colors.primary}
        label="Enable Notifications"
        description="Turn off to disable all notifications"
        value={preferences.enabled}
        onValueChange={handleMasterToggle}
      />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Job Status Changes */}
      <PreferenceRow
        icon="briefcase-outline"
        iconColor="#3b82f6"
        label="Job Status Changes"
        description="When a job moves to a new status"
        value={preferences.jobStatusChanges}
        onValueChange={(v) => handlePreferenceChange('jobStatusChanges', v)}
        disabled={!isMasterEnabled}
      />

      <View style={[styles.dividerShort, { backgroundColor: colors.border }]} />

      {/* Habit Reminders */}
      <PreferenceRow
        icon="repeat-outline"
        iconColor="#8b5cf6"
        label="Habit Reminders"
        description="Daily reminders for incomplete habits"
        value={preferences.habitReminders}
        onValueChange={(v) => handlePreferenceChange('habitReminders', v)}
        disabled={!isMasterEnabled}
      />

      <View style={[styles.dividerShort, { backgroundColor: colors.border }]} />

      {/* Habit Reminder Time */}
      <TimePickerRow
        icon="time-outline"
        iconColor="#8b5cf6"
        label="Reminder Time"
        value={preferences.habitReminderTime}
        onValueChange={(v) => handlePreferenceChange('habitReminderTime', v)}
        disabled={!isMasterEnabled || !preferences.habitReminders}
      />

      <View style={[styles.dividerShort, { backgroundColor: colors.border }]} />

      {/* Task Due Reminders */}
      <PreferenceRow
        icon="checkbox-outline"
        iconColor="#f59e0b"
        label="Task Reminders"
        description="Notifications for upcoming/overdue tasks"
        value={preferences.taskDueReminders}
        onValueChange={(v) => handlePreferenceChange('taskDueReminders', v)}
        disabled={!isMasterEnabled}
      />

      <View style={[styles.dividerShort, { backgroundColor: colors.border }]} />

      {/* Goal Achievements */}
      <PreferenceRow
        icon="trophy-outline"
        iconColor="#10b981"
        label="Goal Achievements"
        description="When you reach your daily goal"
        value={preferences.goalAchievements}
        onValueChange={(v) => handlePreferenceChange('goalAchievements', v)}
        disabled={!isMasterEnabled}
      />

      <View style={[styles.dividerShort, { backgroundColor: colors.border }]} />

      {/* Daily Summary */}
      <PreferenceRow
        icon="stats-chart-outline"
        iconColor="#06b6d4"
        label="Daily Summary"
        description="End-of-day activity summary"
        value={preferences.dailySummary}
        onValueChange={(v) => handlePreferenceChange('dailySummary', v)}
        disabled={!isMasterEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  disabledRow: {
    opacity: 0.5,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  preferenceLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  preferenceDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  timeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  dividerShort: {
    height: 1,
    marginLeft: 60,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  pickerButton: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  picker: {
    height: 200,
  },
});

export default NotificationPreferences;
