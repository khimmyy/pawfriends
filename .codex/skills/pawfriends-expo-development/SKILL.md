---
name: pawfriends-expo-development
description: Implement, debug, or review PawFriends app changes in this repository using its Expo SDK 57, Expo Router, React Native, TypeScript, and SQLite conventions. Use for PawFriends development tasks; do not use for unrelated Expo projects or general product planning.
---

# PawFriends Expo Development

Make focused, working changes that fit the existing PawFriends application.

## Establish context

- Read the applicable `AGENTS.md` instructions and inspect `package.json`, `app.json`, and the files neighboring the requested change.
- Treat the installed versions as authoritative. This project uses Expo SDK 57, React Native 0.86, React 19.2, strict TypeScript, typed routes, the React Compiler, Expo Router, and Expo SQLite.
- Preserve user changes and avoid editing unrelated files. Check the working tree before modifying files.
- Reuse existing components, theme values, route patterns, and import aliases when they fit the task.

## Use version-correct Expo guidance

- Before writing code that depends on Expo or Expo Router behavior, read the relevant documentation for Expo SDK 57 under `https://docs.expo.dev/versions/v57.0.0/`.
- Confirm that examples and APIs apply to SDK 57. If a versioned URL redirects to the latest docs, locate the SDK 57 variant or version-specific section instead of copying current-only behavior.
- Do not upgrade Expo, React Native, Expo Router, or related packages unless the user explicitly requests an upgrade.
- Install Expo and React Native packages with `npx expo install <package>` so compatible versions are selected. Use `npm install` only for packages outside Expo's compatibility management.

## Implement safely

- Keep routes and layouts in `app/` and follow Expo Router file-based routing. Use typed route-compatible paths.
- Prefer cross-platform React Native APIs. When platform-specific behavior is necessary, keep it explicit and verify the affected platforms.
- Maintain strict TypeScript types. Avoid `any` unless an external boundary cannot be typed more narrowly.
- Keep SQLite schema migrations and shared queries centralized in `database/`. Use bound parameters for all user-provided values and never store plaintext passwords or secrets.
- Handle asynchronous loading, empty, success, and error states when the requested flow can encounter them. Show user-facing errors without exposing sensitive implementation details.
- Preserve accessibility for interactive controls with clear labels, adequate touch targets, and readable contrast.
- Do not silently expand a focused request into a broad refactor.

## Verify the result

- Run `npm run lint` after code changes.
- Run `npx tsc --noEmit` for TypeScript changes.
- Add or run the smallest relevant behavioral check when the repository supports one. For navigation or native behavior, state which platforms were actually exercised.
- If verification cannot run, report the exact blocker and do not claim the change passed.

Finish by summarizing the changed files, observable behavior, and verification results.
