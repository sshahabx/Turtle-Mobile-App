/**
 * Profile Screen
 * 
 * User profile with settings, theme toggle, and sign out.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import { signOut, getStoredUser } from '../../features/auth/services/authService';
import * as db from '../../services/database';
import { useEffect, useState } from 'react';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={[styles.userSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'Guest User'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || (isOfflineMode ? 'Offline Mode' : 'Not signed in')}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Settings</Text>
          
          {/* Theme */}
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={cycleTheme}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[styles.themeIcon, { backgroundColor: isDark ? colors.text : colors.textSecondary }]} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{getThemeLabel()}</Text>
          </TouchableOpacity>

          {/* Daily Goal */}
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleGoalPress}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[styles.targetIcon, { borderColor: colors.primary }]} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Goal</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>Set target</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
          
          {isAuthenticated ? (
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <View style={[styles.signOutIcon, { backgroundColor: colors.error }]} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <View style={[styles.signInIcon, { backgroundColor: colors.primary }]} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>Sign In</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textTertiary }]}>Turtle v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: '#fff',
  },
  userInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  userName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  themeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  targetIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  signOutIcon: {
    width: 14,
    height: 3,
    borderRadius: 1,
  },
  signInIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  settingLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  settingValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appVersion: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
});
