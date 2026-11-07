@AGENTS.md

# PawFriends

Cross-platform pet community prototype (Expo SDK 57, React Native 0.86, React 19.2, strict TypeScript 6, Expo Router with typed routes, React Compiler, Expo SQLite). Owners, the signed-in session, pets, posts, likes, saves and comments are stored locally in SQLite (`database/database.ts`, schema version 5). Stories, adoption, vet, activity and the profile stats and post grid still use static data from `data/pets.ts`.

## Commands

- `npm start` / `npm run android` / `npm run ios` / `npm run web` — start Expo
- `npm run lint` — ESLint (eslint-config-expo); must report 0 problems
- `npx tsc --noEmit` — type check; must pass
- Install Expo/RN packages with `npx expo install <pkg>`, never plain `npm install`, and do not upgrade SDK packages unless asked

- `npm test` — Jest (`jest-expo` preset); tests live in `__tests__/`

Lint, type check and `npm test` must all pass; say which platforms you actually ran the app on.

`__tests__/database.test.ts` runs the real migrations and queries in `database/database.ts` against Node's built-in SQLite through `test-utils/sqlite.ts` (needs Node 22.13+), with `expo-crypto` backed by Node's `crypto`. When you change the schema, add a test that upgrades from the previous `user_version`.

Keep `web.output` in `app.json` as `"single"`. With `"static"`, the dev server pre-renders pages with a serializer that cannot handle the expo-sqlite web worker and fails with `Worker chunk not found for: ...expo-sqlite/web/worker.ts`. Do not work around it with `EXPO_NO_METRO_LAZY`: the page then loads but the worker fails with "Bundle splitting is required for Web Worker imports".

In a `.claude/worktrees/*` checkout, run `npm ci` there first; a junction to the main `node_modules` breaks Metro.

## Layout

- `app/_layout.tsx` — `SQLiteProvider` (`pawfriends.db`, `onInit={initializeDatabase}`), `SafeAreaProvider`, `AuthProvider`, and the root `Stack` with `Stack.Protected` guards: `(tabs)` and `modal` need a signed-in owner, `login` and `register` need a signed-out one
- `app/index.tsx` — anchor route; redirects to `/(tabs)/home` or `/login` depending on the session
- `app/login.tsx` (sign in) and `app/register.tsx` (create account) share `components/auth-form.tsx`; validation rules are in `constants/validation.ts`
- `context/auth.tsx` — `AuthProvider` / `useAuth()` exposing `owner`, `isLoading`, `signIn`, `register`, `signOut`; the session is the single-row `session` table, so it survives restarts
- `app/(tabs)/` — `home`, `adoption`, `veterinary`, `notifications`, `profile`; tabs are declared in `app/(tabs)/_layout.tsx`
- `app/pets/new.tsx`, `app/pets/[id].tsx` (add and edit a pet, sharing `components/pet-form.tsx`), `app/posts/new.tsx` (create a post), `app/posts/[id].tsx` (a post and its comments) and `app/posts/saved.tsx`; each must also be listed in the signed-in `Stack.Protected` block in `app/_layout.tsx`
- PawFeed shows posts from the database only (`getFeedPosts(db, viewerId, { search, savedOnly })`), with search in the header; it reloads with `useFocusEffect` so new posts and comment counts appear on return
- `components/PostCard.tsx` is presentational: it takes a `FeedPost` and `onLike` / `onComment` / `onShare` / `onSave`. Screens get those from `hooks/use-post-actions.ts`, which updates the post in the screen's list and returns a `notice` for `components/notice-banner.tsx`
- `utils/` — `pet-photos.ts` (pick photos and copy them into app storage; native only), `navigation.ts` (`goBackOr`, for screens that can be opened without history on the web), `time.ts` (`formatTimeAgo` for SQLite UTC timestamps), `share.ts` (system share sheet; copies to the clipboard in browsers without one)
- `components/` — `PostCard.tsx` is live; `ui/*`, `themed-*`, `parallax-scroll-view`, `hello-wave`, `FeedScreen.tsx` and `app/modal.tsx` are template leftovers and unused
- `database/database.ts` — all schema migrations and queries
- `data/pets.ts` — `COLORS` palette and mock data used by the screens

## Conventions

- Import with the `@/` alias (maps to repo root).
- Screens use `SafeAreaView` from `react-native-safe-area-context` with `edges={['top', 'left', 'right']}` and colors from `COLORS` in `data/pets.ts`. Styles go in a `StyleSheet.create` at the bottom of the file.
- Return JSX directly from screen components. Never define a component inside another component (it remounts on every render and drops TextInput focus).
- Icons come from `Ionicons` in `@expo/vector-icons`.
- Database access goes through functions in `database/database.ts` that take the `SQLiteDatabase` from `useSQLiteContext()`. Always use bound parameters. Schema changes bump `DATABASE_VERSION` and add a step keyed on `PRAGMA user_version` (see the `sqlite-migration` skill).
- Never store plaintext passwords or secrets. The current salted SHA-512 hash is prototype-only.
- Avoid `any`; keep strict types.

## Git

- Work on a feature branch (`khim` or `test`), not `main`. Changes reach `main` only through a pull request.
- Ask before pushing.

## Project skills

In `.claude/skills/`: `pawfriends-expo-development` (general workflow), `add-screen` (new route or tab), `sqlite-migration` (schema changes and queries).
