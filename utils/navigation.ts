import { router, type Href } from 'expo-router';

/**
 * Returns to the previous screen, or goes to `fallback` when there is none
 * (for example after the page was reloaded or opened from a link on the web).
 */
export function goBackOr(fallback: Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
