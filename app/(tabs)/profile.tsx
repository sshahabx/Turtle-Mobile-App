/**
 * Profile Screen
 * 
 * Modern, minimalistic user profile with settings and account management.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useGoal } from '../../features/user/hooks/useGoal';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import { NotificationPreferences } from '../../components/notifications';
import { signOut, getStoredUser } from '../../features/auth/services/authService';
import * as db from '../../services/database';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isAuthenticated, isOfflineMode } = useAuth();
  const { jobs } = useJobs();
  const { dailyGoal } = useGoal();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
    };
    loadUser();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            await db.setOnboarded(false);
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const handleGoalPress = () => {
    router.push('/modals/goal-setting');
  };

  const getThemeIcon = (): keyof typeof Ionicons.glyphMap => {
    if (themeMode === 'light') return 'sunny-outline';
    if (themeMode === 'dark') return 'moon-outline';
    return 'phone-portrait-outline';
  };

  const getThemeLabel = () => {
    if (themeMode === 'light') return 'Light';
    if (themeMode === 'dark') return 'Dark';
    return 'System';
  };

  const cycleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  // Calculate stats
  const totalJobs = jobs.length;
  const todayJobs = jobs.filter(job => {
    const today = new Date();
    const jobDate = new Date(job.createdAt);
    return jobDate.toDateString() === today.toDateString();
  }).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || 'Guest User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || (isOfflineMode ? 'Offline Mode' : 'Not signed in')}
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalJobs}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total Jobs</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{todayJobs}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Today</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{dailyGoal}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Goal</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Preferences</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            {/* Theme */}
            <TouchableOpacity style={styles.settingRow} onPress={cycleTheme}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name={getThemeIcon()} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{getThemeLabel()}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Daily Goal */}
            <TouchableOpacity style={styles.settingRow} onPress={handleGoalPress}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="flag-outline" size={18} color="#f59e0b" />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Goal</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{dailyGoal} apps/day</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Notifications</Text>
          <NotificationPreferences />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Account</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            {isAuthenticated ? (
              <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="log-out-outline" size={18} color={colors.error} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.settingRow} 
                onPress={() => router.replace('/(auth)/sign-in')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons name="log-in-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.primary }]}>Sign In</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={[styles.appName, { color: colors.textTertiary }]}>Turtle</Text>
          <Text style={[styles.appVersion, { color: colors.textTertiary }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    color: '#fff',
  },
  userName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingsCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  settingValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  appName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  appVersion: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
  },
});
