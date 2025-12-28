/**
 * NoteCard Component
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note } from '../../types';
import { formatRelativeDate } from '../../utils/date';

export interface NoteCardProps {
  note: Note;
  onPress?: () => void;
  maxContentLines?: number;
}

function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + '...';
}

export const NoteCard = memo(function NoteCard({ 
  note, 
  onPress, 
  maxContentLines = 2 
}: NoteCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          
          {note.content && (
            <Text style={styles.contentText} numberOfLines={maxContentLines}>
              {truncateContent(note.content, 150)}
            </Text>
          )}
          
          <Text style={styles.date}>
            Updated {formatRelativeDate(note.updatedAt)}
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chevron: {
    color: '#9ca3af',
    marginLeft: 8,
    fontSize: 20,
  },
});

export default NoteCard;
