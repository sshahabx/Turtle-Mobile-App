/**
 * Notes Screen
 * 
 * Displays user notes with create/edit functionality.
 * Uses centralized theme system for consistent styling.
 * Features a personal, journal-like header for emotional connection.
 * 
 * Requirements:
 * - 2.3: Display LimitBanner for Free tier users showing notes usage
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../../features/notes/hooks/useNotes';
import { Note } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';
import { PersonalHeader } from '../../components/notes/PersonalHeader';
import { LimitBanner } from '../../components/ui/LimitBanner';
import { UpgradePrompt } from '../../components/ui/UpgradePrompt';

// Pastel colors for note cards to make them feel more personal
const NOTE_COLORS = [
  { bg: '#FFF9E6', border: '#FFE082' }, // Warm yellow
  { bg: '#E8F5E9', border: '#A5D6A7' }, // Soft green
  { bg: '#E3F2FD', border: '#90CAF9' }, // Light blue
  { bg: '#FCE4EC', border: '#F48FB1' }, // Pink
  { bg: '#F3E5F5', border: '#CE93D8' }, // Lavender
  { bg: '#FFF3E0', border: '#FFCC80' }, // Peach
];

export default function NotesScreen() {
  const router = useRouter();
  const { notes, isLoading, refetch } = useNotes();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

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

  // Get a consistent color for each note based on its index
  const getNoteColor = (index: number) => {
    return NOTE_COLORS[index % NOTE_COLORS.length];
  };

  const renderNote = ({ item, index }: { item: Note; index: number }) => {
    const noteColor = getNoteColor(index);
    
    return (
      <TouchableOpacity 
        style={[
          styles.noteCard, 
          { 
            backgroundColor: noteColor.bg, 
            borderColor: noteColor.border,
          }
        ]} 
        onPress={() => handleNotePress(item)}
      >
        {/* Decorative corner fold */}
        <View style={[styles.cornerFold, { borderTopColor: noteColor.border }]} />
        
        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.noteFooter}>
          <Text style={[styles.noteDate, { color: colors.textTertiary }]}>
            {new Date(item.updatedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: new Date(item.updatedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            })}
          </Text>
          <Ionicons name="document-text-outline" size={14} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Journal</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your personal space</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddNote}>
          <Text style={[styles.addButtonText, { color: colors.textInverse }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Limit Banner - Shows usage for Free tier users (Requirement 2.3) */}
      <View style={styles.limitBannerContainer}>
        <LimitBanner 
          entityType="notes"
          entityLabel="notes"
          onUpgradePress={() => setShowUpgradePrompt(true)}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyState}>
          <PersonalHeader notesCount={0} />
          <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="journal-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your journal awaits</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start capturing your thoughts, ideas, and memories
          </Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleAddNote}>
            <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>Write Your First Note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={<PersonalHeader notesCount={notes.length} />}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onDismiss={() => setShowUpgradePrompt(false)}
        entityType="notes"
      />
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
  headerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
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
  limitBannerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  noteCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 20,
    borderLeftWidth: 20,
    borderLeftColor: 'transparent',
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
    flex: 1,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
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
