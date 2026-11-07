import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 4;

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

  if (currentVersion < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        birthday TEXT,
        photo_uri TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);
    `);
  }

  if (currentVersion < 4) {
    // pet_id is optional: a post can be about no pet, and deleting a pet keeps its posts.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
        pet_id INTEGER REFERENCES pets(id) ON DELETE SET NULL,
        caption TEXT NOT NULL,
        photo_uri TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
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

export const PET_SPECIES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'] as const;
export type PetSpecies = (typeof PET_SPECIES) [number];

export type Pet = {
  id: number;
  ownerId: number;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birthday: string | null;
  photoUri: string | null;
};

export type PetInput = Omit<Pet, 'id' | 'ownerId'>;

type PetRow = {
  id: number;
  owner_id: number;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birthday: string | null;
  photo_uri: string | null;
};

function toPet(row: PetRow): Pet {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    birthday: row.birthday,
    photoUri: row.photo_uri,
  };
}

export async function getPetsForOwner(
  db:SQLiteDatabase, ownerId: number): Promise<Pet[]>
  {
    const rows = await db.getAllAsync<PetRow>(
      `SELECT id, owner_id, name, species, breed, birthday, photo_uri 
      FROM pets WHERE owner_id = ? ORDER BY created_at, id`,
      ownerId
    );
    return rows.map(toPet);
  }

  export async function getPet(db:SQLiteDatabase, ownerId: number, petId: number):
  Promise<Pet | null> {
    const row = await db.getFirstAsync<PetRow>(
      `SELECT id, owner_id, name, species, breed, birthday, photo_uri
     FROM pets WHERE id = ? AND owner_id = ?`,
    petId,
    ownerId
    );
    return row ? toPet(row) : null;
  }

  export async function addPet(db: SQLiteDatabase, ownerId: number, input: PetInput): Promise<number>{
    const result = await db.runAsync(
    `INSERT INTO pets (owner_id, name, species, breed, birthday, photo_uri)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ownerId,
    input.name,
    input.species,
    input.breed,
    input.birthday,
    input.photoUri
    );
    return result.lastInsertRowId;
  }

  export async function updatePet(db: SQLiteDatabase, ownerId: number, petId: number, input: PetInput) {
  await db.runAsync(
    `UPDATE pets
     SET name = ?, species = ?, breed = ?, birthday = ?, photo_uri = ?
     WHERE id = ? AND owner_id = ?`,
    input.name,
    input.species,
    input.breed,
    input.birthday,
    input.photoUri,
    petId,
    ownerId
  );
}

export type PostInput = {
  /** The pet the post is about, or null for a post about no particular pet. */
  petId: number | null;
  caption: string;
  photoUri: string | null;
};

/** A post with the names needed to show it in the feed. */
export type FeedPost = {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  petId: number | null;
  petName: string | null;
  petPhotoUri: string | null;
  caption: string;
  photoUri: string | null;
  /** SQLite CURRENT_TIMESTAMP in UTC, e.g. "2026-11-07 14:05:09". */
  createdAt: string;
};

type FeedPostRow = {
  id: number;
  owner_id: number;
  owner_name: string;
  owner_email: string;
  pet_id: number | null;
  pet_name: string | null;
  pet_photo_uri: string | null;
  caption: string;
  photo_uri: string | null;
  created_at: string;
};

function toFeedPost(row: FeedPostRow): FeedPost {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    petId: row.pet_id,
    petName: row.pet_name,
    petPhotoUri: row.pet_photo_uri,
    caption: row.caption,
    photoUri: row.photo_uri,
    createdAt: row.created_at,
  };
}

/** Saves a post and returns its id. Throws if petId is not one of the owner's pets. */
export async function addPost(db: SQLiteDatabase, ownerId: number, input: PostInput): Promise<number> {
  if (input.petId !== null && !(await getPet(db, ownerId, input.petId))) {
    throw new Error('That pet does not belong to this owner.');
  }

  const result = await db.runAsync(
    `INSERT INTO posts (owner_id, pet_id, caption, photo_uri)
     VALUES (?, ?, ?, ?)`,
    ownerId,
    input.petId,
    input.caption,
    input.photoUri
  );
  return result.lastInsertRowId;
}

/** The newest posts on this device, newest first. */
export async function getFeedPosts(db: SQLiteDatabase, limit = 50): Promise<FeedPost[]> {
  const rows = await db.getAllAsync<FeedPostRow>(
    `SELECT posts.id, posts.owner_id, owners.full_name AS owner_name, owners.email AS owner_email,
            posts.pet_id, pets.name AS pet_name, pets.photo_uri AS pet_photo_uri,
            posts.caption, posts.photo_uri, posts.created_at
     FROM posts
     JOIN owners ON owners.id = posts.owner_id
     LEFT JOIN pets ON pets.id = posts.pet_id
     ORDER BY posts.created_at DESC, posts.id DESC
     LIMIT ?`,
    limit
  );
  return rows.map(toFeedPost);
}
