import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewProps, StyleSheet } from 'react-native';

export interface SkeletonProps extends ViewProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  ...props
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function SkeletonCard({ style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="60%" height={16} style={styles.marginBottom} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={styles.marginBottom} />
      <Skeleton width="80%" height={14} />
    </View>
  );
}

export interface SkeletonListProps extends ViewProps {
  count?: number;
}

export function SkeletonList({ count = 3, style, ...props }: SkeletonListProps) {
  return (
    <View style={style} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={styles.listItem} />
      ))}
    </View>
  );
}

export function SkeletonText({
  lines = 1,
  style,
  ...props
}: ViewProps & { lines?: number }) {
  return (
    <View style={style} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={14}
          style={index < lines - 1 ? styles.marginBottom : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  marginBottom: {
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 12,
  },
});

export default Skeleton;
