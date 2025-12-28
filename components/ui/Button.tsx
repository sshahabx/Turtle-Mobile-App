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

export interface ButtonProps extends Omit<TouchableOpacityProps, 'disabled'> {
  variant?: ButtonVariant;
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

export function Button({
  variant = 'primary',
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

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles.container,
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
          <Text style={[styles.text, variantStyles.text, { marginLeft: 8 }]}>
            {children}
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, variantStyles.text]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: componentBorderRadius.button, // 12px as per requirements
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.semibold, // Outfit-SemiBold as per requirements
    fontSize: fontSize.base,
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
