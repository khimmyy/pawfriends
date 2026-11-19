import { useAuth } from '@/context/auth';
import { toggleLike, toggleSave, type FeedPost } from '@/database/database';
import { sharePost } from '@/utils/share';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const NOTICE_DURATION_MS = 3000;

/**
 * Like, save, comment and share actions for a list of posts held in `setPosts`.
 * Each action updates the matching post in the list after the database changes.
 * `notice` is a short message to show the viewer, such as "Copied" after sharing on the web.
 */
export function usePostActions(setPosts: Dispatch<SetStateAction<FeedPost[]>>) {
  const db = useSQLiteContext();
  const { owner } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const updatePost = (postId: number, changes: Partial<FeedPost>) => {
    setPosts((posts) => posts.map((post) => (post.id === postId ? { ...post, ...changes } : post)));
  };

  const like = async (post: FeedPost) => {
    if (!owner) return;
    try {
      const { liked, likeCount } = await toggleLike(db, owner.id, post.id);
      updatePost(post.id, { likedByMe: liked, likeCount });
    } catch {
      setNotice('Could not update your like. Please try again.');
    }
  };

  /** Returns the new saved state, or null if saving failed. */
  const save = async (post: FeedPost): Promise<boolean | null> => {
    if (!owner) return null;
    try {
      const saved = await toggleSave(db, owner.id, post.id);
      updatePost(post.id, { savedByMe: saved });
      setNotice(saved ? 'Saved. Find it under Saved posts.' : 'Removed from Saved posts.');
      return saved;
    } catch {
      setNotice('Could not update Saved posts. Please try again.');
      return null;
    }
  };

  const comment = (post: FeedPost) => {
    router.push({ pathname: '/posts/[id]', params: { id: String(post.id) } });
  };

  const share = async (post: FeedPost) => {
    const result = await sharePost(post);
    if (result === 'copied') {
      setNotice('Post copied. Paste it anywhere to share.');
    } else if (result === 'unavailable') {
      setNotice('Sharing is not available here.');
    }
  };

  return { like, save, comment, share, notice };
}
