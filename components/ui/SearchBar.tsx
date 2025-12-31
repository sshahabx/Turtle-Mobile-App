import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface SearchBarProps extends Omit<TextInputProps, 'onChangeText'> {
  /** Current search value */
  value: string;
  /** Callback when search text changes (debounced) */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
}

/**
 * SearchBar component with search icon, clear button, and debounced input.
 * 
 * Features:
 * - Controlled input with search icon on left
 * - Clear button appears when text is present
 * - Debounced onChange handler to avoid excessive filtering
 * - Uses theme colors and typography for consistency
 * 
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * 
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search jobs..."
 * />
 * ```
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  debounceMs = 300,
  style,
  ...props
}: SearchBarProps) {
  const { colors } = useTheme();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const internalValueRef = useRef(value);

  // Sync internal value with external value
  useEffect(() => {
    internalValueRef.current = value;
  }, [value]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      internalValueRef.current = text;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        onChangeText(text);
      }, debounceMs);
    },
    [onChangeText, debounceMs]
  );

  const handleClear = useCallback(() => {
    // Clear immediately without debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    internalValueRef.current = '';
    onChangeText('');
  }, [onChangeText]);

  const showClearButton = value.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Search Icon */}
      <Ionicons
        name="search"
        size={20}
        color={colors.textTertiary}
        style={styles.searchIcon}
      />

      {/* Text Input */}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never" // We use custom clear button
        {...props}
      />

      {/* Clear Button */}
      {showClearButton && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: componentBorderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44, // Minimum touch target size
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    padding: 0, // Remove default padding
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
});

export default SearchBar;
