import { PostCard, type Post } from '@/components/PostCard';
import { COLORS, POSTS, STORIES } from '@/data/pets';
import { getFeedPosts, type FeedPost } from '@/database/database';
import { formatTimeAgo } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Shapes a saved post for PostCard: titled by the pet when one is tagged, otherwise the owner. */
function toCardPost(post: FeedPost): Post {
  return {
    id: post.id,
    pet: post.petName ?? post.ownerName,
    owner: `@${post.ownerEmail.split('@')[0]}`,
    avatar: post.petPhotoUri,
    image: post.photoUri,
    caption: post.caption,
    likes: 0,
    comments: 0,
    time: formatTimeAgo(post.createdAt),
  };
}

function openNewPost() {
  router.push('/posts/new');
}

export default function FeedScreen() {
  const db = useSQLiteContext();
  const [posts, setPosts] = useState<FeedPost[]>([]);

  // Reload whenever the feed comes back into view, so a post just shared appears at the top.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getFeedPosts(db)
        .then((result) => {
          if (active) setPosts(result);
        })
        .catch((error: unknown) => {
          console.warn('Could not load posts', error);
        });
      return () => {
        active = false;
      };
    }, [db])
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 PawFeed</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.circleButton}><Ionicons name="search" size={18} color={COLORS.dark} /></Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a post"
            onPress={openNewPost}
            style={styles.circleButton}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.dark} />
          </Pressable>
          <Pressable style={styles.circleButton}><Ionicons name="menu-outline" size={18} color={COLORS.dark}/></Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.storiesCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesList}>
            <View style={styles.storyItem}>
              <View style={styles.addStory}><Text style={styles.plus}>+</Text></View>
              <Text style={styles.storyName}>Your pet</Text>
            </View>
            {STORIES.map((story) => (
              <View key={story.id} style={styles.storyItem}>
                <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
                <Text numberOfLines={1} style={styles.storyName}>{story.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promptCard}>
          <Image source={{ uri: STORIES[0].avatar }} style={styles.promptAvatar} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a post"
            onPress={openNewPost}
            style={styles.promptButton}
          >
            <Text style={styles.promptText}>What&apos;s your pet up to today?</Text>
          </Pressable>
        </View>

        {posts.map((post) => <PostCard key={`saved-${post.id}`} post={toCardPost(post)} />)}
        {POSTS.map((post) => <PostCard key={`sample-${post.id}`} post={post} />)}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.08)' },
  title: { fontSize: 25, fontWeight: '800', color: COLORS.blue },
  headerActions: { flexDirection: 'row', gap: 8 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  storiesCard: { backgroundColor: COLORS.white, paddingVertical: 12, marginBottom: 8 },
  storiesList: { paddingHorizontal: 16, gap: 14 },
  storyItem: { alignItems: 'center', width: 62 },
  addStory: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.blue, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 28, color: COLORS.blue, fontWeight: '700' },
  storyAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: COLORS.blue },
  storyName: { marginTop: 5, fontSize: 11, color: COLORS.muted, fontWeight: '500', textAlign: 'center' },
  promptCard: { backgroundColor: COLORS.white, marginBottom: 8, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  promptAvatar: { width: 42, height: 42, borderRadius: 21 },
  promptButton: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11 },
  promptText: { color: COLORS.muted, fontSize: 14 },
});
