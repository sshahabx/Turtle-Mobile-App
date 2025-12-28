/**
 * EmptyState Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No jobs yet',
  message = 'Start tracking your job applications by adding your first job.',
  icon = 'clipboard',
  actionLabel = 'Add Your First Job',
  onAction,
}: EmptyStateProps) {
  const getIconSymbol = () => {
    switch (icon) {
      case 'target': return '◎';
      case 'note': return '☰';
      case 'check': return '✓';
      case 'clipboard': return '☐';
      default: return '○';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIconSymbol()}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onAction && (
        <View style={styles.buttonContainer}>
          <Button onPress={onAction} variant="primary">
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    color: '#9ca3af',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    minWidth: 200,
  },
});

export default EmptyState;
