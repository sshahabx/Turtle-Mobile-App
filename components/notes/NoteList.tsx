/**
 * NoteList Component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, RefreshControl, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Note } from '../../types';
import { sortNotesByUpdatedAt } from '../../features/notes/utils/noteUtils';
import { NoteCard } from './NoteCard';
import { EmptyState } from '../dashboard/EmptyState';

export interface NoteListProps {
  notes: Note[];
  onNotePress?: (note: Note) => void;
  onAddNote?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
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
  emptyTitle = 'No notes yet',
  emptyMessage = 'Start capturing your thoughts by adding your first note.',
}: NoteListProps) {
  const sortedNotes = useMemo(() => sortNotesByUpdatedAt(notes), [notes]);

  const renderItem = useCallback(({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={() => onNotePress?.(item)}
    />
  ), [onNotePress]);

  const keyExtractor = useCallback((item: Note) => item.id, []);

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
});

export default NoteList;
