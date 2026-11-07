@AGENTS.md

# PawFriends

Cross-platform pet community prototype (Expo SDK 57, React Native 0.86, React 19.2, strict TypeScript 6, Expo Router with typed routes, React Compiler, Expo SQLite). Owner registration is stored locally in SQLite; the feed, adoption, vet, activity, and profile tabs still use static data from `data/pets.ts`.

## Commands

- `npm start` / `npm run android` / `npm run ios` / `npm run web` — start Expo
- `npm run lint` — ESLint (eslint-config-expo); must report 0 problems
- `npx tsc --noEmit` — type check; must pass
- Install Expo/RN packages with `npx expo install <pkg>`, never plain `npm install`, and do not upgrade SDK packages unless asked

There are no automated tests yet. Lint and type check are the required checks; say which platforms you actually ran.

Known issue: `npm run web` currently fails with `Worker chunk not found for: ...expo-sqlite/web/worker.ts` (Metro serializer, seen on Windows with Expo 57.0.30). Test on Android/iOS until it is fixed.

In a `.claude/worktrees/*` checkout, run `npm ci` there first; a junction to the main `node_modules` breaks Metro.

## Layout

- `app/_layout.tsx` — `SQLiteProvider` (`pawfriends.db`, `onInit={initializeDatabase}`), `SafeAreaProvider`, `AuthProvider`, and the root `Stack` with `Stack.Protected` guards: `(tabs)` and `modal` need a signed-in owner, `login` and `register` need a signed-out one
- `app/index.tsx` — anchor route; redirects to `/(tabs)/home` or `/login` depending on the session
- `app/login.tsx` (sign in) and `app/register.tsx` (create account) share `components/auth-form.tsx`; validation rules are in `constants/validation.ts`
- `context/auth.tsx` — `AuthProvider` / `useAuth()` exposing `owner`, `isLoading`, `signIn`, `register`, `signOut`; the session is the single-row `session` table, so it survives restarts
- `app/(tabs)/` — `home`, `adoption`, `veterinary`, `notifications`, `profile`; tabs are declared in `app/(tabs)/_layout.tsx`
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
