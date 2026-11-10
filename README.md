# PawFriends

PawFriends is a cross-platform pet community prototype built with Expo and React Native. It brings together a social feed, pet adoption listings, veterinary reminders, activity notifications, and pet profiles in one app.

The project has moved from Firebase to a device-local SQLite data layer: the Firebase SDK and `firebaseConfig.ts` have been removed, and owner records are now stored in `pawfriends.db`. The rest of the app currently uses static development data and UI-only interactions.

## Current status

Implemented or in progress:

- Expo Router navigation with PawFeed, Adopt, Vet, Activity, and Profile tabs
- A local SQLite provider initialized at the app root
- Versioned database setup with WAL mode, foreign keys, and an `owners` table
- Owner registration data handling with normalized, unique email addresses and bound SQL parameters
- Per-record random password salts and SHA-512 hashes generated with `expo-crypto`
- Registration form with required-field checks, duplicate-email error handling, and keyboard-aware layout (tap outside a field to dismiss the keyboard)
- Static pet stories, feed posts, adoption content, veterinary services, notifications, and profile data
- PawFeed header with search, new-post, and menu buttons (visual only)
- Expo SQLite web support through WebAssembly and COOP/COEP headers
- Typed Expo Router routes and the React Compiler (the New Architecture is the SDK 57 default, so `newArchEnabled` and `edgeToEdgeEnabled` are no longer set in `app.json`)
- Config plugins for `expo-router`, `expo-splash-screen`, `expo-font`, `expo-image`, `expo-web-browser`, `expo-status-bar`, and `expo-sqlite`

Still to build:

- Existing-owner sign-in, sign-out, and persistent sessions
- Authentication-aware route protection
- Password reset, email verification, and account recovery
- A production authentication backend and cross-device synchronization
- Persistent posts, adoption listings, notifications, and profile editing
- Working search, posting, adoption, veterinary booking, and other currently visual-only actions
- Automated tests and production-ready validation

## Technology stack

- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- TypeScript 6
- Expo Router 57
- Expo SQLite 57
- Expo Crypto 57
- React Navigation 7

## Prerequisites

- [Node.js](https://nodejs.org/) 22.13.x or newer
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go), an Android emulator, an iOS simulator, or a web browser

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/khimmyy/pawfriends.git
cd pawfriends
npm install
```

Start the Expo development server:

```bash
npm start
```

Follow the terminal instructions to open the project on a supported target. You can also start one directly:

```bash
npm run android
npm run ios
npm run web
```

> Expo SQLite's web support is currently alpha. This repository includes the required Metro WebAssembly configuration and development/EAS Hosting COOP/COEP headers. Other web hosts must send equivalent headers.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start the Android target |
| `npm run ios` | Start the iOS target |
| `npm run web` | Start the web target |
| `npm run lint` | Run the Expo ESLint checks |
| `npx tsc --noEmit` | Run the TypeScript type check |

## Project structure

```text
app/
  _layout.tsx          Root stack, SQLite provider, and safe-area provider
  index.tsx            Initial redirect to owner registration
  login.tsx            Owner registration form
  (tabs)/
    _layout.tsx        Bottom-tab navigation
    home.tsx           PawFeed stories and posts
    adoption.tsx       Adoption discovery prototype
    veterinary.tsx     Veterinary services prototype
    notifications.tsx  Activity feed prototype
    profile.tsx        Pet profile prototype
components/            Reusable UI components
constants/             Theme constants
data/                  Static development data
database/
  database.ts          SQLite schema migration and owner queries
hooks/                 Shared React hooks
metro.config.js        Metro configuration, including SQLite web support
app.json               Expo config, plugins, and COOP/COEP headers for web
AGENTS.md              Instructions for AI coding agents (CLAUDE.md points here)
.codex/skills/         Project development skill for AI coding agents
```

## Local owner storage

`app/_layout.tsx` opens `pawfriends.db` through `SQLiteProvider` and calls the migration in `database/database.ts`. Database version 1 creates the following local table:

```text
owners
  id             INTEGER PRIMARY KEY
  full_name      TEXT NOT NULL
  email          TEXT NOT NULL, case-insensitive, unique
  password_salt  TEXT NOT NULL
  password_hash  TEXT NOT NULL
  created_at     TEXT NOT NULL
```

Registration trims the owner's name, normalizes the email address to lowercase, generates a random 16-byte salt, hashes the supplied password with SHA-512, and inserts the record using bound parameters. The database persists locally across app restarts.

### Security scope

This registration flow is for local prototyping only. Although plaintext passwords are not stored, a single salted SHA-512 digest is not an appropriate production password-storage design, and the default SQLite database is not encrypted. Production accounts should use a trusted authentication service or a server-side, slow password-hashing design with secure session management. Do not store service credentials, access tokens, or other secrets in this database.

## Known issues

- The "Already have an account? Log in" text is not yet wired to a sign-in flow.

## Contributing

- Follow `AGENTS.md`: read the Expo SDK 57 docs at <https://docs.expo.dev/versions/v57.0.0/> before writing code.
- Install Expo and React Native packages with `npx expo install <package>` so SDK-compatible versions are selected, and don't upgrade Expo or React Native unless that is the goal of the change.
- Keep schema migrations and queries in `database/`, always use bound parameters, and never store plaintext passwords or secrets.
- Run `npm run lint` and `npx tsc --noEmit` before opening a pull request.
- The full development conventions for AI coding agents live in `.codex/skills/pawfriends-expo-development/SKILL.md`.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
