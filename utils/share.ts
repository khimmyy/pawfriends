import type { FeedPost } from '@/database/database';
import { Platform, Share } from 'react-native';

export type ShareResult = 'shared' | 'copied' | 'dismissed' | 'unavailable';

/** The text sent to other apps when a post is shared. */
export function shareMessage(post: Pick<FeedPost, 'petName' | 'ownerName' | 'caption'>) {
  const author = post.petName ?? post.ownerName;
  return `${author} on PawFriends: "${post.caption}"`;
}

/**
 * Opens the system share sheet. Browsers without a share sheet copy the
 * text to the clipboard instead, so the caller can say it was copied.
 */
export async function sharePost(post: Pick<FeedPost, 'petName' | 'ownerName' | 'caption'>): Promise<ShareResult> {
  const message = shareMessage(post);

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
    try {
      await navigator.clipboard.writeText(message);
      return 'copied';
    } catch {
      return 'unavailable';
    }
  }

  try {
    const result = await Share.share({ message });
    return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
  } catch {
    return 'unavailable';
  }
}
