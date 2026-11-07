---
name: sqlite-migration
description: Add or change PawFriends SQLite tables, migrations, and queries in database/database.ts using expo-sqlite and PRAGMA user_version. Use when persisting new data (posts, pets, sessions, profiles), changing the schema, or writing database queries.
---

# SQLite migrations and queries

The database is `pawfriends.db`, opened by `SQLiteProvider` in `app/_layout.tsx`, which runs `initializeDatabase` from `database/database.ts` on startup. Everything schema- or query-related lives in `database/database.ts`. Check the SDK 57 expo-sqlite docs (`https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/`) before using an API you have not seen in this file.

## Adding a migration

Migrations are sequential steps keyed on `PRAGMA user_version`. Never edit a step that has already shipped; users' devices have already run it.

1. Bump `DATABASE_VERSION` by one.
2. Add a new block after the existing ones, guarded by the previous version:

```ts
if (currentVersion < 2) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);
  `);
}
```

3. Keep the final `PRAGMA user_version = ${DATABASE_VERSION}` line last.
4. Note: the existing version 1 block checks `currentVersion === 0`. New steps should use `currentVersion < N` so a fresh install runs every step in order.

Foreign keys are enabled at startup (`PRAGMA foreign_keys = ON`), so use `REFERENCES` for relations.

## Writing queries

- Export a typed function per operation that takes `db: SQLiteDatabase` first, e.g. `getPetsForOwner(db, ownerId)`. Screens get `db` from `useSQLiteContext()` and call these functions; no SQL in screen files.
- Always bind parameters (`?` placeholders as extra arguments). Never interpolate user input into SQL strings.
- Use `getFirstAsync<T>` for one row, `getAllAsync<T>` for lists, `runAsync` for writes (returns `lastInsertRowId` and `changes`). Type rows with a snake_case row type and map to camelCase at the boundary.
- Wrap multi-statement writes in `db.withTransactionAsync(async () => { ... })`.
- Normalize inputs the same way registration does (trim names, lowercase emails).
- Surface constraint errors to the caller; screens turn them into friendly messages (see the `UNIQUE constraint failed` handling in `app/login.tsx`).

## Security

- Never store plaintext passwords, API keys, or tokens. Passwords use `expo-crypto`: random 16-byte salt plus SHA-512, which is acceptable for this local prototype only.
- The database is not encrypted; keep sensitive data out of it.

## Verify

1. `npm run lint` and `npx tsc --noEmit`.
2. Run the app on a fresh install and on an existing install (already at the old version) to confirm both reach the new `user_version` without errors. On web, clearing site data gives a fresh database.
