import React from 'react';
import { View, Text, ViewProps, StyleSheet } from 'react-native';
import { JobStatus } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { statusColors, semanticColors, lightColors, darkColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

/**
 * Get variant colors based on theme and variant type
 * Uses theme colors for consistent styling
 */
const getVariantColors = (
  variant: BadgeVariant,
  isDark: boolean
): { bg: string; text: string } => {
  const colors = isDark ? darkColors : lightColors;
  
  switch (variant) {
    case 'default':
      return { 
        bg: colors.backgroundTertiary, 
        text: colors.textSecondary 
      };
    case 'success':
      return { 
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', 
        text: isDark ? '#34d399' : '#15803d' 
      };
    case 'warning':
      return { 
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7', 
        text: isDark ? '#fbbf24' : '#b45309' 
      };
    case 'error':
      return { 
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', 
        text: isDark ? '#f87171' : '#b91c1c' 
      };
    case 'info':
      return { 
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', 
        text: isDark ? '#60a5fa' : '#1d4ed8' 
      };
    default:
      return { 
        bg: colors.backgroundTertiary, 
        text: colors.textSecondary 
      };
  }
};

export function Badge({ variant = 'default', children, style, ...props }: BadgeProps) {
  const { isDark } = useTheme();
  const variantColors = getVariantColors(variant, isDark);

  return (
    <View
      style={[
        styles.container, 
        { backgroundColor: variantColors.bg }, 
        style
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: variantColors.text }]}>
        {children}
      </Text>
    </View>
  );
}

export interface StatusBadgeProps extends Omit<ViewProps, 'children'> {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { label: string; variant: BadgeVariant }> = {
  [JobStatus.PENDING]: { label: 'Pending', variant: 'default' },
  [JobStatus.APPLIED]: { label: 'Applied', variant: 'info' },
  [JobStatus.INTERVIEWING]: { label: 'Interviewing', variant: 'warning' },
  [JobStatus.OFFERED]: { label: 'Offered', variant: 'success' },
  [JobStatus.ACCEPTED]: { label: 'Accepted', variant: 'success' },
  [JobStatus.REJECTED]: { label: 'Rejected', variant: 'error' },
};

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm + 2, // 10px
    paddingVertical: spacing.xs, // 4px
    borderRadius: componentBorderRadius.badge, // 6px as per requirements
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fontFamily.medium, // Outfit-Medium as per requirements
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
});

export default Badge;
