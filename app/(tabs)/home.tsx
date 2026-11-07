import { NoticeBanner } from '@/components/notice-banner';
import { PawLogo } from '@/components/paw-logo';
import { BRAND_FONTS } from '@/constants/fonts';
import { PostCard } from '@/components/PostCard';
import { useAuth } from '@/context/auth';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import { STORIES } from '@/data/pets';
import { getFeedPosts, type FeedPost } from '@/database/database';
import { usePostActions } from '@/hooks/use-post-actions';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function openNewPost() {
  router.push('/posts/new');
}

function openSavedPosts() {
  router.push('/posts/saved');
}

export default function FeedScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const db = useSQLiteContext();
  const { owner } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const actions = usePostActions(setPosts);
  const searching = search.trim().length > 0;

  // Reload when the feed comes back into view (so new posts and comments show) and as the search changes.
  useFocusEffect(
    useCallback(() => {
      if (!owner) {
        return;
      }
      let active = true;
      getFeedPosts(db, owner.id, { search })
        .then((result) => {
          if (active) setPosts(result);
        })
        .catch((error: unknown) => {
          console.warn('Could not load posts', error);
        });
      return () => {
        active = false;
      };
    }, [db, owner, search])
  );

  const toggleSearch = () => {
    if (searchOpen) {
      setSearch('');
    }
    setSearchOpen(!searchOpen);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <PawLogo size={30} accessibilityLabel={null} />
          <Text style={styles.title}>PawFeed</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? 'Close search' : 'Search posts'}
            onPress={toggleSearch}
            style={[styles.circleButton, searchOpen && styles.circleButtonActive]}
          >
            <Ionicons name={searchOpen ? 'close' : 'search'} size={18} color={searchOpen ? colors.onPrimary : colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a post"
            onPress={openNewPost}
            style={styles.circleButton}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Saved posts"
            onPress={openSavedPosts}
            style={styles.circleButton}
          >
            <Ionicons name="bookmark-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {searchOpen ? (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search posts"
            placeholder="Search captions, pets or owners"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {searching ? (
          <Text style={styles.resultCount}>
            {posts.length === 1 ? '1 post' : `${posts.length} posts`} matching “{search.trim()}”
          </Text>
        ) : (
          <>
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
          </>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={actions.like}
            onComment={actions.comment}
            onShare={actions.share}
            onSave={actions.save}
          />
        ))}

        {posts.length === 0 ? (
          <View style={styles.empty}>
            {searching ? (
              <Ionicons name="search" size={32} color={colors.muted} />
            ) : (
              <PawLogo size={44} accessibilityLabel={null} />
            )}
            <Text style={styles.emptyTitle}>{searching ? 'No posts match your search' : 'No posts yet'}</Text>
            <Text style={styles.emptyText}>
              {searching ? 'Try a pet name or a different word.' : 'Share what your pet is up to and it will show up here.'}
            </Text>
          </View>
        ) : null}
        <View style={{ height: 16 }} />
      </ScrollView>

      <NoticeBanner message={actions.notice} />
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.page },
  header: { backgroundColor: c.surface, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 28, fontFamily: BRAND_FONTS.bold, color: c.text },
  headerActions: { flexDirection: 'row', gap: 8 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.page, alignItems: 'center', justifyContent: 'center' },
  circleButtonActive: { backgroundColor: c.primary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border },
  searchInput: { flex: 1, backgroundColor: c.page, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: c.text },
  resultCount: { color: c.muted, fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
  storiesCard: { backgroundColor: c.surface, paddingVertical: 12, marginBottom: 8 },
  storiesList: { paddingHorizontal: 16, gap: 14 },
  storyItem: { alignItems: 'center', width: 62 },
  addStory: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: c.primary, backgroundColor: c.page, alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 28, color: c.primary, fontWeight: '700' },
  storyAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: c.primary },
  storyName: { marginTop: 5, fontSize: 11, color: c.muted, fontWeight: '500', textAlign: 'center' },
  promptCard: { backgroundColor: c.surface, marginBottom: 8, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  promptAvatar: { width: 42, height: 42, borderRadius: 21 },
  promptButton: { flex: 1, backgroundColor: c.page, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11 },
  promptText: { color: c.muted, fontSize: 14 },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40, gap: 6 },
  emptyTitle: { color: c.text, fontSize: 16, fontWeight: '700', marginTop: 6 },
  emptyText: { color: c.muted, textAlign: 'center' },
});
