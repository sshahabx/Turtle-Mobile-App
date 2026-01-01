/**
 * NoteList Component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, RefreshControl, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Note } from '../../types';
import { sortNotesByUpdatedAt } from '../../features/notes/utils/noteUtils';
import { NoteCard } from './NoteCard';
import { EmptyState } from '../dashboard/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export interface NoteListProps {
  notes: Note[];
  onNotePress?: (note: Note) => void;
  onAddNote?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

const ItemSeparator = memo(() => <View style={styles.separator} />);
ItemSeparator.displayName = 'ItemSeparator';

export const NoteList = memo(function NoteList({
  notes,
  onNotePress,
  onAddNote,
  isRefreshing = false,
  onRefresh,
  isLoading = false,
  emptyTitle = 'No notes yet',
  emptyMessage = 'Start capturing your thoughts by adding your first note.',
}: NoteListProps) {
  const { colors } = useTheme();
  const sortedNotes = useMemo(() => sortNotesByUpdatedAt(notes), [notes]);

  const renderItem = useCallback(({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={() => onNotePress?.(item)}
    />
  ), [onNotePress]);

  const keyExtractor = useCallback((item: Note) => item.id, []);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading notes...</Text>
      </View>
    );
  }

  if (sortedNotes.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon="note"
        actionLabel="Add Your First Note"
        onAction={onAddNote}
      />
    );
  }

  return (
    <FlashList
      data={sortedNotes}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  separator: {
    height: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});

export default NoteList;
