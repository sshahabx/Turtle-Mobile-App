import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { lightColors, darkColors, semanticColors } from '../../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'disabled'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const getVariantStyles = (
  variant: ButtonVariant,
  isDark: boolean
): { container: ViewStyle; text: TextStyle } => {
  const colors = isDark ? darkColors : lightColors;
  
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: colors.primary },
        text: { color: colors.textInverse },
      };
    case 'secondary':
      return {
        container: { backgroundColor: colors.backgroundTertiary },
        text: { color: colors.text },
      };
    case 'outline':
      return {
        container: { 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: colors.primary 
        },
        text: { color: colors.primary },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        text: { color: colors.textSecondary },
      };
    case 'destructive':
      return {
        container: { backgroundColor: semanticColors.error },
        text: { color: '#ffffff' },
      };
    default:
      return {
        container: { backgroundColor: colors.primary },
        text: { color: colors.textInverse },
      };
  }
};

const getSizeStyles = (size: ButtonSize): { container: ViewStyle; text: TextStyle } => {
  switch (size) {
    case 'sm':
      return {
        container: { paddingHorizontal: 12, paddingVertical: 8 },
        text: { fontSize: fontSize.sm },
      };
    case 'lg':
      return {
        container: { paddingHorizontal: 20, paddingVertical: 14 },
        text: { fontSize: fontSize.lg },
      };
    case 'md':
    default:
      return {
        container: { paddingHorizontal: 16, paddingVertical: 10 },
        text: { fontSize: fontSize.base },
      };
  }
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { isDark, colors } = useTheme();
  const isDisabled = disabled || loading;
  const variantStyles = getVariantStyles(variant, isDark);
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      onPress={onPress}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'destructive' ? '#ffffff' : colors.primary}
          />
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, { marginLeft: 8 }]}>
            {children}
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: componentBorderRadius.button, // 12px as per requirements
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.semibold, // Outfit-SemiBold as per requirements
    lineHeight: fontSize.base * lineHeight.tight,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
