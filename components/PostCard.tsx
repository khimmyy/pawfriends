import { PawLogo } from '@/components/paw-logo';
import { COLORS } from '@/data/pets';
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
        <Text style={styles.meta}>❤️ {post.likeCount.toLocaleString()}</Text>
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
          onPress={() => onSave(post)}
          yellow
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
  yellow?: boolean;
  onPress: () => void;
};

function ActionButton({ label, accessibilityLabel, icon, active = false, yellow = false, onPress }: ActionButtonProps) {
  const activeColor = yellow ? COLORS.yellow : COLORS.blue;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.actionButton}
    >
      <Ionicons name={icon} size={18} color={active ? activeColor : COLORS.muted} />
      <Text style={[styles.actionText, active && { color: activeColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.07)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: COLORS.blue },
  avatarPlaceholder: { backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  petName: { fontWeight: '700', color: COLORS.dark, fontSize: 15 },
  meta: { color: COLORS.muted, fontSize: 12 },
  caption: { color: COLORS.dark, fontSize: 14, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 10 },
  postImage: { width: '100%', height: 320, backgroundColor: '#D8E4F7' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.07)' },
  actions: { flexDirection: 'row', paddingHorizontal: 6 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 44 },
  actionText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
});
