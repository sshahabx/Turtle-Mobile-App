/**
 * Note Detail Screen
 */

import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNote, useNotes } from '../../features/notes/hooks/useNotes';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/date';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { note, isLoading, error } = useNote(id);
  const { deleteNote, isDeleting } = useNotes();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleEdit = () => {
    router.push({ pathname: '/modals/edit-note', params: { id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNote(id!);
            await success();
            router.back();
          } catch (err) {
            await hapticError();
            Alert.alert('Error', 'Failed to delete note.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !note) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Note not found</Text>
        <View style={styles.goBackButton}>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>Updated {formatDate(note.updatedAt)}</Text>
        <Text style={[styles.content, { color: colors.text }]}>{note.content}</Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.buttonWrapper}>
          <Button variant="outline" onPress={handleEdit}>Edit</Button>
        </View>
        <View style={styles.buttonWrapper}>
          <Button variant="destructive" onPress={handleDelete} loading={isDeleting}>Delete</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  goBackButton: {
    marginTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  content: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginTop: spacing.lg,
    lineHeight: 24,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});
