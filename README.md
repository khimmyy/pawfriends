# PawFriends

PawFriends is an Expo and React Native mobile application for pet owners and animal lovers. It includes a social feed, adoption listings, veterinary information, notifications, and profiles.

The project currently uses Firebase Authentication for owner registration and Cloud Firestore for owner profile data. SQLite is recommended for local/offline data such as cached pets, favorites, drafts, and pending synchronization work.

## Current status

Implemented:

- Expo Router navigation with home, adoption, veterinary, notification, and profile tabs
- Email/password owner registration with Firebase Authentication
- Owner profile creation in the Firestore `owners` collection
- Static sample pet and feed data

Not yet implemented:

- Existing-user sign-in and sign-out
- Authentication-aware route protection
- Password reset and email verification
- Persistent Firebase authentication on native devices
- SQLite schema and synchronization
- Production Firestore Security Rules stored in this repository

## Technology stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Firebase Authentication
- Cloud Firestore
- Optional local storage with `expo-sqlite`

## Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Expo Go](https://expo.dev/go) or an Android/iOS emulator

## Installation

Clone the repository:

```bash
git clone https://github.com/khimmyy/pawfriends.git
cd pawfriends
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

From the Expo terminal, follow the displayed instructions to open the project in Expo Go, an Android emulator, an iOS simulator, or a browser.

## Available commands

```bash
npm start          # Start the Expo development server
npm run android    # Start on Android
npm run ios        # Start on iOS
npm run web        # Start in a browser
npm run lint       # Run Expo ESLint checks
```

## Project structure

```text
app/
  _layout.tsx          Root navigation layout
  index.tsx            Initial redirect
  login.tsx            Owner registration screen
  (tabs)/
    home.tsx           Social feed
    adoption.tsx       Adoption listings
    veterinary.tsx     Veterinary information
    notifications.tsx  Activity notifications
    profile.tsx        User profile
components/            Reusable UI components
constants/             Theme constants
data/                  Static development data
hooks/                 Shared React hooks
firebaseConfig.ts      Firebase app, Auth, and Firestore initialization
```

## Firebase authentication

Firebase is initialized in `firebaseConfig.ts`. The registration flow is in `app/login.tsx`.

When an owner registers:

1. The app validates that the name, email, and password fields are present.
2. `createUserWithEmailAndPassword` creates the Firebase Authentication account.
3. Firebase automatically signs in the new account.
4. The Firebase user UID becomes the document ID at `owners/{uid}`.
5. The app stores the owner's name, email, and creation time in Firestore.
6. The app navigates to the home tab.

Before running registration, enable **Email/Password** under Firebase Console → Authentication → Sign-in method and create a Cloud Firestore database.

The Firebase client configuration identifies the Firebase project; it is not an administrator credential. Never commit service-account keys or other private backend credentials.

### Recommended Firestore rules

The repository does not currently contain a Firestore rules file. At minimum, owner documents should be restricted to their matching authenticated user:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /owners/{ownerId} {
      allow create, read, update, delete:
        if request.auth != null && request.auth.uid == ownerId;
    }
  }
}
```

Review and test all rules before deploying them to production.

## Local SQLite storage

SQLite is useful when PawFriends needs data that remains available offline on one device. Good candidates include:

- Cached pet and feed records
- Favorite pets
- Unsubmitted posts or adoption drafts
- A queue of changes waiting to be synchronized with Firestore

SQLite should not contain user passwords, Firebase refresh tokens, service-account credentials, or other application secrets. It is local device storage and does not synchronize automatically between devices.

### Install SQLite

This repository does not currently include SQLite. Add the Expo SDK 54-compatible version with:

```bash
npx expo install expo-sqlite
```

A recommended integration is to:

1. Add a `SQLiteProvider` around the router in `app/_layout.tsx`.
2. Create versioned migrations in a `database/` directory.
3. Use `runAsync` with bound parameters for inserts, updates, and deletes.
4. Use `getFirstAsync`, `getAllAsync`, or `getEachAsync` for reads.
5. Treat Firestore as the shared source of truth and SQLite as an offline cache when data must be shared across users.

Always bind values instead of inserting user input directly into SQL:

```ts
await db.runAsync(
  "INSERT INTO favorites (user_uid, pet_id) VALUES (?, ?)",
  [userUid, petId]
);
```

### View SQLite data on Expo SDK 54

You can inspect records from a temporary development screen or the React Native console:

```ts
const tables = await db.getAllAsync(
  "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
);

const pets = await db.getAllAsync("SELECT * FROM pets");

console.log("Tables:", tables);
console.log("Pets:", pets);
```

Expo's built-in graphical SQLite inspector was introduced after SDK 54. If the project is upgraded to a compatible newer Expo SDK, start the app, press `Shift+M` in the Expo terminal, and select **Open expo-sqlite**.

## Firebase and SQLite responsibilities

| Data | Recommended storage |
| --- | --- |
| Account email/password authentication | Firebase Authentication |
| Shared owner profile | Cloud Firestore |
| Shared posts and adoption listings | Cloud Firestore |
| Cached pets and posts | SQLite |
| Favorites needed across devices | Firestore, optionally cached in SQLite |
| Device-only favorites | SQLite |
| Offline drafts and synchronization queue | SQLite |
| Secrets and service-account credentials | Never store in the client app |

## Security notes

- Protect all Firestore collections with Security Rules.
- Do not treat navigation as authorization; validate access at the database layer.
- Do not store passwords or manually copied Firebase tokens in SQLite.
- Use parameterized SQLite queries to prevent SQL injection.
- Ordinary SQLite files are not encrypted. Sensitive local data requires an appropriate encrypted-storage design.
- Do not display raw backend error details to users in production.

## Documentation

- [Expo SDK 54 documentation](https://docs.expo.dev/versions/v54.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SQLite](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
