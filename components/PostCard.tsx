import { COLORS } from '@/data/pets';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Post = {
  id: number;
  pet: string;
  owner: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  time: string;
};

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((current) => {
      setCount((likes) => (current ? likes - 1 : likes + 1));
      return !current;
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.petName}>{post.pet}</Text>
          <Text style={styles.meta}>{post.owner} · {post.time}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.muted} />
      </View>

      <Text style={styles.caption}>{post.caption}</Text>
      <Image source={{ uri: post.image }} style={styles.postImage} />

      <View style={styles.countRow}>
        <Text style={styles.meta}>❤️ {count.toLocaleString()}</Text>
        <Text style={styles.meta}>{post.comments} comments</Text>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Like" icon={liked ? 'heart' : 'heart-outline'} active={liked} onPress={toggleLike} />
        <ActionButton label="Comment" icon="chatbubble-outline" onPress={() => {}} />
        <ActionButton label="Share" icon="share-social-outline" onPress={() => {}} />
        <ActionButton label="Save" icon={saved ? 'bookmark' : 'bookmark-outline'} active={saved} onPress={() => setSaved(!saved)} yellow />
      </View>
    </View>
  );
}

function ActionButton({ label, icon, active, yellow, onPress }: any) {
  const activeColor = yellow ? COLORS.yellow : COLORS.blue;
  return (
    <Pressable onPress={onPress} style={styles.actionButton}>
      <Ionicons name={icon} size={18} color={active ? activeColor : COLORS.muted} />
      <Text style={[styles.actionText, active && { color: activeColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.07)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: COLORS.blue },
  petName: { fontWeight: '700', color: COLORS.dark, fontSize: 15 },
  meta: { color: COLORS.muted, fontSize: 12 },
  caption: { color: COLORS.dark, fontSize: 14, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 10 },
  postImage: { width: '100%', height: 320, backgroundColor: '#D8E4F7' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.07)' },
  actions: { flexDirection: 'row', paddingHorizontal: 6 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11 },
  actionText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
});
