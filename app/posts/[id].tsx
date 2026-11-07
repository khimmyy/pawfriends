import { NoticeBanner } from '@/components/notice-banner';
import { PostCard } from '@/components/PostCard';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/context/auth';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import {
  addComment,
  getComments,
  getPost,
  MAX_COMMENT_LENGTH,
  type Comment,
  type FeedPost,
} from '@/database/database';
import { usePostActions } from '@/hooks/use-post-actions';
import { goBackOr } from '@/utils/navigation';
import { formatTimeAgo } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function leavePostDetail() {
  goBackOr('/(tabs)/home');
}

export default function PostDetailScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const db = useSQLiteContext();
  const { owner } = useAuth();
  // Held as a one-item list so the shared like/save actions can update it.
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const actions = usePostActions(setPosts);
  const post = posts[0];

  useEffect(() => {
    if (!owner) {
      return;
    }
    let active = true;
    Promise.all([getPost(db, owner.id, postId), getComments(db, postId)])
      .then(([foundPost, foundComments]) => {
        if (!active) return;
        setPosts(foundPost ? [foundPost] : []);
        setComments(foundComments);
      })
      .catch((error: unknown) => {
        console.warn('Could not load the post', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [db, owner, postId]);

  if (!owner) {
    return null;
  }

  const sendComment = async () => {
    if (!draft.trim() || !post) {
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      await addComment(db, owner.id, post.id, draft);
      const updated = await getComments(db, post.id);
      setComments(updated);
      setPosts([{ ...post, commentCount: updated.length }]);
      setDraft('');
    } catch {
      setSendError('Could not post your comment. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const canSend = draft.trim().length > 0 && !sending;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <ScreenHeader title="Post" onBack={leavePostDetail} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !post ? (
        <View style={styles.center}>
          <Text style={styles.message}>This post is no longer available.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <PostCard
              post={post}
              onLike={actions.like}
              onComment={() => inputRef.current?.focus()}
              onShare={actions.share}
              onSave={actions.save}
            />

            <Text style={styles.sectionTitle}>Comments</Text>
            {comments.length === 0 ? (
              <Text style={styles.emptyText}>No comments yet. Be the first to say something nice!</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentInitial}>{comment.ownerName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>
                      {comment.ownerName}
                      <Text style={styles.commentTime}> · {formatTimeAgo(comment.createdAt)}</Text>
                    </Text>
                    <Text style={styles.commentBody}>{comment.body}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {sendError ? <Text style={styles.sendError}>{sendError}</Text> : null}
          <View style={styles.composer}>
            <TextInput
              ref={inputRef}
              accessibilityLabel="Write a comment"
              placeholder="Write a comment…"
              placeholderTextColor={colors.muted}
              value={draft}
              onChangeText={setDraft}
              maxLength={MAX_COMMENT_LENGTH}
              multiline
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send comment"
              accessibilityState={{ disabled: !canSend, busy: sending }}
              disabled={!canSend}
              onPress={sendComment}
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            >
              {sending ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Ionicons name="send" size={18} color={colors.onPrimary} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      <NoticeBanner message={actions.notice} />
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.page },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { color: c.text, fontSize: 16 },
  sectionTitle: { color: c.text, fontSize: 16, fontWeight: '800', marginHorizontal: 16, marginTop: 8, marginBottom: 10 },
  emptyText: { color: c.muted, marginHorizontal: 16, marginBottom: 16 },
  comment: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  commentInitial: { color: c.onPrimary, fontWeight: '800' },
  commentBubble: { flex: 1, backgroundColor: c.surface, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  commentAuthor: { color: c.text, fontWeight: '700', fontSize: 13 },
  commentTime: { color: c.muted, fontWeight: '400' },
  commentBody: { color: c.text, marginTop: 2, lineHeight: 20 },
  sendError: { color: c.danger, textAlign: 'center', paddingHorizontal: 16, paddingBottom: 6 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: c.surface, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.border },
  input: { flex: 1, maxHeight: 120, backgroundColor: c.page, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: c.text },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.4 },
});
