import { NoticeBanner } from '@/components/notice-banner';
import { PostCard } from '@/components/PostCard';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/context/auth';
import { COLORS } from '@/data/pets';
import { getFeedPosts, type FeedPost } from '@/database/database';
import { usePostActions } from '@/hooks/use-post-actions';
import { goBackOr } from '@/utils/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function leaveSavedPosts() {
  goBackOr('/(tabs)/home');
}

export default function SavedPostsScreen() {
  const db = useSQLiteContext();
  const { owner } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const actions = usePostActions(setPosts);

  useFocusEffect(
    useCallback(() => {
      if (!owner) {
        return;
      }
      let active = true;
      getFeedPosts(db, owner.id, { savedOnly: true })
        .then((result) => {
          if (active) setPosts(result);
        })
        .catch((error: unknown) => {
          console.warn('Could not load saved posts', error);
        });
      return () => {
        active = false;
      };
    }, [db, owner])
  );

  // Unsaving here also takes the post off this list.
  const handleSave = async (post: FeedPost) => {
    const saved = await actions.save(post);
    if (saved === false) {
      setPosts((current) => current.filter((item) => item.id !== post.id));
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScreenHeader title="Saved posts" onBack={leaveSavedPosts} />
      <ScrollView>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={actions.like}
            onComment={actions.comment}
            onShare={actions.share}
            onSave={handleSave}
          />
        ))}
        {posts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>Tap Save on a post in PawFeed to keep it here.</Text>
          </View>
        ) : null}
      </ScrollView>
      <NoticeBanner message={actions.notice} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, gap: 6 },
  emptyTitle: { color: COLORS.dark, fontSize: 16, fontWeight: '700', marginTop: 6 },
  emptyText: { color: COLORS.muted, textAlign: 'center' },
});
