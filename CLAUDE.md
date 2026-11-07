@AGENTS.md

# PawFriends

Cross-platform pet community prototype (Expo SDK 57, React Native 0.86, React 19.2, strict TypeScript 6, Expo Router with typed routes, React Compiler, Expo SQLite). Owners, the signed-in session, pets, posts, likes, saves, comments and app settings are stored locally in SQLite (`database/database.ts`, schema version 6). Stories, adoption, vet, activity and the profile stats and post grid still use static data from `data/pets.ts`.

## Commands

- `npm start` / `npm run android` / `npm run ios` / `npm run web` — start Expo
- `npm run lint` — ESLint (eslint-config-expo); must report 0 problems
- `npx tsc --noEmit` — type check; must pass
- Install Expo/RN packages with `npx expo install <pkg>`, never plain `npm install`, and do not upgrade SDK packages unless asked

- `npm test` — Jest (`jest-expo` preset); tests live in `__tests__/`
- `npm run dev-db` — rebuilds `pawfriends-dev.db` (git-ignored) with the real schema from `database/database.ts` and sample data, for browsing in a SQLite viewer (the recommended VS Code extension is SQLite Viewer). It runs the TypeScript directly, so it needs Node 22.18+. It is not the app's database: to inspect that, press Shift+M in the Expo CLI terminal and choose "Open expo-sqlite"
- `npm run generate-theme` — rewrites `global.css` (Tailwind / Reusables CSS variables) from `constants/colors.ts`. Run it after changing a palette; `__tests__/tailwind-theme.test.ts` fails if they drift apart
- Add React Native Reusables components with `npx @react-native-reusables/cli@latest add <name>` (they land in `components/ui/`); `npx @react-native-reusables/cli@latest doctor` checks the setup. Never run its `init`: that scaffolds a new project

Lint, type check and `npm test` must all pass; say which platforms you actually ran the app on.

`__tests__/database.test.ts` runs the real migrations and queries in `database/database.ts` against Node's built-in SQLite through `test-utils/sqlite.ts` (needs Node 22.13+), with `expo-crypto` backed by Node's `crypto`. When you change the schema, add a test that upgrades from the previous `user_version`.

Keep `web.output` in `app.json` as `"single"`. With `"static"`, the dev server pre-renders pages with a serializer that cannot handle the expo-sqlite web worker and fails with `Worker chunk not found for: ...expo-sqlite/web/worker.ts`. Do not work around it with `EXPO_NO_METRO_LAZY`: the page then loads but the worker fails with "Bundle splitting is required for Web Worker imports".

In a `.claude/worktrees/*` checkout, run `npm ci` there first; a junction to the main `node_modules` breaks Metro.

## Layout

- `app/_layout.tsx` — `SQLiteProvider` (`pawfriends.db`, `onInit={initializeDatabase}`), `SafeAreaProvider`, `AuthProvider`, and the root `Stack` with `Stack.Protected` guards: `(tabs)` and `modal` need a signed-in owner, `login` and `register` need a signed-out one
- `app/index.tsx` — anchor route; redirects to `/(tabs)/home` or `/login` depending on the session
- `app/login.tsx` and `app/register.tsx` both render `components/auth-flow.tsx` (blue brand header, then a card with a Sign in / Create account switch, icon fields, show-password button); they differ only in the starting mode. Validation rules are in `constants/validation.ts`. `components/auth-form.tsx` keeps the plainer `AuthField` / `AuthButton` / `FormError` used by the pet and post forms
- Brand font: Fredoka (`@expo-google-fonts/fredoka`), loaded in `app/_layout.tsx` before anything renders. Use `BRAND_FONTS` from `constants/fonts.ts` for the "PawFriends" name and brand titles only, with `fontFamily` and no `fontWeight`
- `context/auth.tsx` — `AuthProvider` / `useAuth()` exposing `owner`, `isLoading`, `signIn`, `register`, `signOut`; the session is the single-row `session` table, so it survives restarts
- `app/(tabs)/` — `home`, `adoption`, `veterinary`, `notifications`, `profile`; tabs are declared in `app/(tabs)/_layout.tsx`
- `app/pets/new.tsx`, `app/pets/[id].tsx` (add and edit a pet, sharing `components/pet-form.tsx`), `app/posts/new.tsx` (create a post), `app/posts/[id].tsx` (a post and its comments) and `app/posts/saved.tsx`; each must also be listed in the signed-in `Stack.Protected` block in `app/_layout.tsx`
- PawFeed shows posts from the database only (`getFeedPosts(db, viewerId, { search, savedOnly })`), with search in the header; it reloads with `useFocusEffect` so new posts and comment counts appear on return
- `components/PostCard.tsx` is presentational: it takes a `FeedPost` and `onLike` / `onComment` / `onShare` / `onSave`. Screens get those from `hooks/use-post-actions.ts`, which updates the post in the screen's list and returns a `notice` for `components/notice-banner.tsx`
- Logo: a violet paw with a coral heart in the pad. Its shapes live in `constants/logo-shape.json`; `components/paw-logo.tsx` (`PawLogo`) draws it in the app, and `npm run generate-logo` (`scripts/generate-logo-assets.js`) redraws `assets/images/` icon, Android icon layers, splash image, favicon and `logo.svg` from the same file. Change the JSON, then rerun the script; don't edit those PNGs by hand
- `components/animated-splash.tsx` waves the logo on launch: `app/_layout.tsx` keeps the native splash (lavender `#F6F3FF`, or `#13101C` with `splash-icon-dark.png` in dark mode, in `app.json`) up until the database opens, then shows this over the app until the session has loaded (at least 1.7 s; still when the device asks for reduced motion)
- `utils/` — `pet-photos.ts` (pick photos and copy them into app storage; native only), `navigation.ts` (`goBackOr`, for screens that can be opened without history on the web), `time.ts` (`formatTimeAgo` for SQLite UTC timestamps), `share.ts` (system share sheet; copies to the clipboard in browsers without one)
- `components/` — `PostCard.tsx` is live; `components/ui/` holds React Native Reusables components (added by its CLI; restyle with `className`, don't rewrite them to StyleSheet). `themed-*`, `parallax-scroll-view`, `hello-wave`, `haptic-tab`, `external-link`, `FeedScreen.tsx` and `app/modal.tsx` are template leftovers and unused
- `database/database.ts` — all schema migrations and queries
- `constants/colors.ts` — `lightColors` and `darkColors` (type `Palette`, same keys): violet `primary` with `onPrimary` for content on it, ink `text`, `muted`, lavender `page`, `surface` for cards and bars, mint `accent`, coral `heart`, with `*Text` shades for small text. `__tests__/colors.test.ts` checks both palettes keep text readable (4.5:1). The logo script and `app.json` repeat a few values; change them together. `data/pets.ts` holds only sample content
- `context/theme.tsx` — `ThemeProvider` / `useTheme()` / `useColors()`. Appearance is System, Light or Dark (saved in the `settings` table; picked in `components/appearance-picker.tsx` on Profile). `app/_layout.tsx` also passes the palette to the navigation theme (imported from `expo-router/react-navigation`; since SDK 56 the app must not import `@react-navigation/*` directly) and flips the status bar

## Conventions

- Import with the `@/` alias (maps to repo root).
- Screens use `SafeAreaView` from `react-native-safe-area-context` with `edges={['top', 'left', 'right']}`. Colors always come from the theme: `const colors = useColors(); const styles = createStyles(colors);` with `const createStyles = (c: Palette) => StyleSheet.create({...})` at the bottom of the file, and `colors.x` for inline icon colors. Never hard-code hex values or import a palette into a screen, or dark mode breaks.
- Return JSX directly from screen components. Never define a component inside another component (it remounts on every render and drops TextInput focus).
- Two styling systems, one palette: app screens use `StyleSheet` + `useColors()`; React Native Reusables components (`components/ui/`) use Tailwind classes via NativeWind 4 (`className`, `cn()` from `lib/utils.ts`). Their colors are CSS variables in `global.css` generated from the same palettes, and `context/theme.tsx` sets NativeWind's color scheme from the Appearance setting, so both follow System / Light / Dark. Setup: `babel.config.js`, `metro.config.js` (`withNativeWind`, plus the `.wasm` asset and COOP/COEP headers that expo-sqlite needs on the web), `tailwind.config.js` (`darkMode: "class"`), `global.css` imported first in `app/_layout.tsx`, `PortalHost` in the root layout, `lib/theme.ts` (`THEME`, `NAV_THEME`). Keep `tailwind-merge` on 2.x (3.x is for Tailwind v4)
- Icons come from `Ionicons` in `@expo/vector-icons`.
- Database access goes through functions in `database/database.ts` that take the `SQLiteDatabase` from `useSQLiteContext()`. Always use bound parameters. Schema changes bump `DATABASE_VERSION` and add a step keyed on `PRAGMA user_version` (see the `sqlite-migration` skill).
- Never store plaintext passwords or secrets. The current salted SHA-512 hash is prototype-only.
- Avoid `any`; keep strict types.

## Git

- Work on a feature branch (`khim` or `test`), not `main`. Changes reach `main` only through a pull request.
- Ask before pushing.

## Project skills

In `.claude/skills/`: `pawfriends-expo-development` (general workflow), `add-screen` (new route or tab), `sqlite-migration` (schema changes and queries).
