/**
 * ProfileSidebar Component
 * 
 * A slide-out sidebar that appears when the profile icon is tapped.
 * Contains navigation options for Journey and Profile screens.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import { getStoredUser } from '../../features/auth/services/authService';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

export function ProfileSidebar({ visible, onClose }: ProfileSidebarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, isOfflineMode } = useAuth();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
    };
    loadUser();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  const handleSignIn = () => {
    onClose();
    setTimeout(() => {
      router.replace('/(auth)/sign-in');
    }, 200);
  };

  // Journey is only available for authenticated users
  const journeyEnabled = isAuthenticated && !isOfflineMode;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.surface,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
          },
        ]}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
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
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Navigation Options */}
        <View style={styles.menuSection}>
          {/* Journey Option */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              !journeyEnabled && styles.menuItemDisabled,
            ]}
            onPress={() => journeyEnabled ? handleNavigation('/(tabs)/journey') : handleSignIn()}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <View style={styles.journeyIcon}>
                <View style={[styles.journeyTrunk, { backgroundColor: colors.primary }]} />
                <View style={[styles.journeyCanopy, { backgroundColor: colors.primary }]} />
              </View>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: journeyEnabled ? colors.text : colors.textSecondary }]}>
                Journey
              </Text>
              {!journeyEnabled && (
                <Text style={[styles.menuHint, { color: colors.textTertiary }]}>
                  Sign in to track your journey
                </Text>
              )}
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={journeyEnabled ? colors.textTertiary : colors.textTertiary} 
            />
          </TouchableOpacity>

          {/* Profile Option */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeButton, { borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 72,
    height: 72,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: '#fff',
  },
  userName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
  menuSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  menuItemDisabled: {
    opacity: 0.8,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  menuHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  journeyIcon: {
    width: 20,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  journeyTrunk: {
    width: 4,
    height: 8,
    borderRadius: 1,
  },
  journeyCanopy: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 14,
    borderRadius: 8,
  },
  closeButton: {
    marginHorizontal: spacing.lg,
    marginTop: 'auto',
    marginBottom: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
});

export default ProfileSidebar;
