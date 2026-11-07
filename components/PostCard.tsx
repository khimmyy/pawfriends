import { PawLogo } from '@/components/paw-logo';
import { type Palette } from '@/constants/colors';
import { useColors } from '@/context/theme';
import type { FeedPost } from '@/database/database';
import { formatTimeAgo } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type PostCardProps = {
  post: FeedPost;
  onLike: (post: FeedPost) => void;
  onComment: (post: FeedPost) => void;
  onShare: (post: FeedPost) => void;
  onSave: (post: FeedPost) => void;
};

function plural(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? '' : 's'}`;
}

/** A feed post. It is titled by the tagged pet, or by the owner when no pet is tagged. */
export function PostCard({ post, onLike, onComment, onShare, onSave }: PostCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const title = post.petName ?? post.ownerName;
  const handle = `@${post.ownerEmail.split('@')[0]}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {post.petPhotoUri ? (
          <Image source={{ uri: post.petPhotoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <PawLogo size={24} accessibilityLabel={null} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.petName}>{title}</Text>
          <Text style={styles.meta}>
            {handle} · {formatTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.caption}>{post.caption}</Text>
      {post.photoUri ? <Image source={{ uri: post.photoUri }} style={styles.postImage} /> : null}

      <View style={styles.countRow}>
        <View style={styles.likeCount}>
          <Ionicons name="heart" size={13} color={colors.heart} />
          <Text style={styles.meta}>{post.likeCount.toLocaleString()}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => onComment(post)} hitSlop={8}>
          <Text style={styles.meta}>{plural(post.commentCount, 'comment')}</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <ActionButton
          label={post.likedByMe ? 'Liked' : 'Like'}
          accessibilityLabel={post.likedByMe ? `Unlike ${title}'s post` : `Like ${title}'s post`}
          icon={post.likedByMe ? 'heart' : 'heart-outline'}
          active={post.likedByMe}
          tone="heart"
          onPress={() => onLike(post)}
        />
        <ActionButton
          label="Comment"
          accessibilityLabel={`Comment on ${title}'s post`}
          icon="chatbubble-outline"
          onPress={() => onComment(post)}
        />
        <ActionButton
          label="Share"
          accessibilityLabel={`Share ${title}'s post`}
          icon="share-social-outline"
          onPress={() => onShare(post)}
        />
        <ActionButton
          label={post.savedByMe ? 'Saved' : 'Save'}
          accessibilityLabel={post.savedByMe ? `Unsave ${title}'s post` : `Save ${title}'s post`}
          icon={post.savedByMe ? 'bookmark' : 'bookmark-outline'}
          active={post.savedByMe}
          tone="accent"
          onPress={() => onSave(post)}
        />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  /** Color when active: coral for likes, mint for saves. */
  tone?: 'heart' | 'accent';
  onPress: () => void;
};

function ActionButton({ label, accessibilityLabel, icon, active = false, tone = 'accent', onPress }: ActionButtonProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  // Icons use the bright accent; labels use its darker shade so the small text stays readable.
  const activeColors =
    tone === 'heart' ? { icon: colors.heart, text: colors.heartText } : { icon: colors.accent, text: colors.accentText };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.actionButton}
    >
      <Ionicons name={icon} size={18} color={active ? activeColors.icon : colors.muted} />
      <Text style={[styles.actionText, active && { color: activeColors.text }]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
  card: { backgroundColor: c.surface, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: c.primary },
  avatarPlaceholder: { backgroundColor: c.page, alignItems: 'center', justifyContent: 'center' },
  petName: { fontWeight: '700', color: c.text, fontSize: 15 },
  meta: { color: c.muted, fontSize: 12 },
  caption: { color: c.text, fontSize: 14, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 10 },
  postImage: { width: '100%', height: 320, backgroundColor: c.imagePlaceholder },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  likeCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', paddingHorizontal: 6 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 44 },
  actionText: { color: c.muted, fontWeight: '600', fontSize: 13 },
});
