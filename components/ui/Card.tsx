import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { spacing } from '../../theme/spacing';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export interface PressableCardProps extends Omit<TouchableOpacityProps, 'children'> {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function PressableCard({ children, style, ...props }: PressableCardProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: componentBorderRadius.card, // 16px as per requirements
    padding: spacing.md, // 16px
    borderWidth: 1,
    // Subtle shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Subtle elevation for Android
    elevation: 1,
  },
});

export default Card;
