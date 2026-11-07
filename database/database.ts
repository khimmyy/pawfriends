import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 2;

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS owners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  if (currentVersion < 2) {
    // A single-row table holding the owner who is currently signed in on this device.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export type Owner = {
  id: number;
  fullName: string;
  email: string;
};

type OwnerRow = {
  id: number;
  full_name: string;
  email: string;
};

type OwnerCredentialsRow = OwnerRow & {
  password_salt: string;
  password_hash: string;
};

type RegisterOwnerInput = {
  fullName: string;
  email: string;
  password: string;
};

function toOwner(row: OwnerRow): Owner {
  return { id: row.id, fullName: row.full_name, email: row.email };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hashPassword(salt: string, password: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA512, `${salt}:${password}`);
}

// Compares every character so the time taken does not reveal how much of the hash matched.
function hashesMatch(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  let difference = 0;
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

export async function registerOwner(db: SQLiteDatabase, input: RegisterOwnerInput): Promise<Owner> {
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const passwordHash = await hashPassword(salt, input.password);
  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);

  const result = await db.runAsync(
    `INSERT INTO owners (full_name, email, password_salt, password_hash)
     VALUES (?, ?, ?, ?)`,
    fullName,
    email,
    salt,
    passwordHash
  );

  return { id: result.lastInsertRowId, fullName, email };
}

/** Returns the owner when the email and password match, otherwise null. */
export async function verifyOwner(
  db: SQLiteDatabase,
  email: string,
  password: string
): Promise<Owner | null> {
  const row = await db.getFirstAsync<OwnerCredentialsRow>(
    `SELECT id, full_name, email, password_salt, password_hash
     FROM owners
     WHERE email = ?`,
    normalizeEmail(email)
  );

  if (!row) {
    return null;
  }

  const attemptedHash = await hashPassword(row.password_salt, password);
  return hashesMatch(attemptedHash, row.password_hash) ? toOwner(row) : null;
}

export async function getSessionOwner(db: SQLiteDatabase): Promise<Owner | null> {
  const row = await db.getFirstAsync<OwnerRow>(
    `SELECT owners.id, owners.full_name, owners.email
     FROM session
     JOIN owners ON owners.id = session.owner_id
     WHERE session.id = 1`
  );
  return row ? toOwner(row) : null;
}

export async function saveSession(db: SQLiteDatabase, ownerId: number) {
  await db.runAsync(
    `INSERT OR REPLACE INTO session (id, owner_id, created_at)
     VALUES (1, ?, CURRENT_TIMESTAMP)`,
    ownerId
  );
}

export async function clearSession(db: SQLiteDatabase) {
  await db.runAsync('DELETE FROM session WHERE id = 1');
}
