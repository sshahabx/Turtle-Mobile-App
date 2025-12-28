/**
 * Notes Screen
 * 
 * Displays user notes with create/edit functionality.
 * Uses centralized theme system for consistent styling.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotes } from '../../features/notes/hooks/useNotes';
import { Note } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export default function NotesScreen() {
  const router = useRouter();
  const { notes, isLoading, refetch } = useNotes();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleNotePress = (note: Note) => {
    router.push({ pathname: '/note/[id]', params: { id: note.id } });
  };

  const handleAddNote = () => {
    router.push('/modals/add-note');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity 
      style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
      onPress={() => handleNotePress(item)}
    >
      <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>{item.content}</Text>
      <Text style={[styles.noteDate, { color: colors.textTertiary }]}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notes</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddNote}>
          <Text style={[styles.addButtonText, { color: colors.textInverse }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.emptyIconLines}>
              <View style={[styles.emptyIconLine, { backgroundColor: colors.textTertiary, width: 20 }]} />
              <View style={[styles.emptyIconLine, { backgroundColor: colors.textTertiary, width: 14 }]} />
              <View style={[styles.emptyIconLine, { backgroundColor: colors.textTertiary, width: 20 }]} />
            </View>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Start capturing your thoughts</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleAddNote}>
            <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>Add Your First Note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  noteCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  noteTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
  },
  noteContent: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  noteDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconLines: {
    alignItems: 'flex-start',
  },
  emptyIconLine: {
    height: 3,
    borderRadius: 1,
    marginVertical: 2,
  },
  emptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing['2xl'],
  },
  emptyButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
});
