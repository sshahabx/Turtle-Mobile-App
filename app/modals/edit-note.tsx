/**
 * Edit Note Modal Screen
 * 
 * Displays as a bottom sheet taking 70% of screen height.
 */

import React from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNote, useNotes } from '../../features/notes/hooks/useNotes';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { NoteForm } from '../../components/notes/NoteForm';
import { NoteCreateInput } from '../../types';
import { fontFamily, fontSize, spacing } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function EditNoteModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { note, isLoading } = useNote(id);
  const { updateNote, isUpdating } = useNotes();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleSubmit = async (data: NoteCreateInput) => {
    if (!id) return;
    try {
      await updateNote({ id, ...data });
      await success();
      router.back();
    } catch (error) {
      await hapticError();
      Alert.alert('Error', 'Failed to update note.');
    }
  };

  const handleCancel = () => router.back();

  if (isLoading) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Note not found</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleCancel} />
      <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Note</Text>
        </View>
        <NoteForm
          initialValues={note}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isUpdating}
          submitLabel="Save Changes"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
});
