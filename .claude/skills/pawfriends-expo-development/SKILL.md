---
name: pawfriends-expo-development
description: Implement, debug, or review PawFriends app changes using this repo's Expo SDK 57, Expo Router, React Native, TypeScript, and SQLite conventions. Use for any code change in this repository.
---

# PawFriends Expo development

Make focused, working changes that fit the existing app.

## 1. Establish context

- Check `git status` and the current branch first. Work on `khim` or another feature branch, never directly on `main`. Preserve uncommitted user changes.
- Read `package.json`, `app.json`, and the files next to the one you are changing. Installed versions are authoritative: Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6 strict, typed routes, React Compiler.
- Reuse what exists: `COLORS` from `@/data/pets`, `PostCard`, the `@/` alias, `Ionicons`, the screen header pattern used by the tab screens.

## 2. Use SDK 57 docs

- Before writing code that depends on Expo or Expo Router behaviour, read the matching page under `https://docs.expo.dev/versions/v57.0.0/`. If a page redirects to "latest", find the SDK 57 section instead of copying newer APIs.
- Install Expo/RN packages with `npx expo install <pkg>`. Do not upgrade Expo, React Native, or Expo Router unless asked.

## 3. Implement

- Routes and layouts live in `app/` (file-based routing). Use typed-route paths such as `"/(tabs)/home"`.
- Screen components return their JSX directly. Do not define components inside components; with `TextInput`s this remounts the tree and closes the keyboard on each keystroke.
- Keep strict types; no `any` unless an external boundary forces it.
- All schema and queries go in `database/database.ts` with bound parameters (see the `sqlite-migration` skill). Never store plaintext passwords or secrets.
- Handle loading, empty, success, and error states for async flows. Show friendly errors without leaking internals.
- Interactive controls need an `accessibilityLabel`, a touch target of about 44pt, and readable contrast.
- Do not expand a focused request into a broad refactor.

## 4. Verify

Run both and fix anything they report:

```bash
npm run lint
npx tsc --noEmit
```

In a `.claude/worktrees/*` checkout without its own `node_modules`, run TypeScript as `node ../../../node_modules/typescript/bin/tsc --noEmit`; `npx expo lint` resolves the parent `node_modules` on its own.

Type check passing does not prove a screen renders (a component returning `undefined` type-checks). For UI changes, run the app (`npm run web` is quickest) or say clearly that it was not run, and name the platforms you did exercise.

Finish by summarizing changed files, the visible behaviour, and verification results.
