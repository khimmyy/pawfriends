/**
 * Builds pawfriends-dev.db in the project folder: the app's real schema (from
 * database/database.ts) filled with sample owners, pets, posts, likes, saves and
 * comments, so you can open it in a SQLite viewer such as VS Code's "SQLite Viewer".
 *
 *   npm run dev-db
 *
 * The file is rebuilt from scratch on every run and is not used by the app.
 * The sample accounts can sign in only if you copy this file into a device yourself;
 * their password is SAMPLE_PASSWORD below.
 *
 * Needs Node 22.18 or newer (it runs the TypeScript files directly).
 */
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..', '..');
const outputFile = path.join(projectRoot, 'pawfriends-dev.db');
const SAMPLE_PASSWORD = 'pawfriends-sample';

// database.ts imports expo-crypto, a native module; point it at a Node version instead.
const cryptoShimUrl = pathToFileURL(path.join(here, 'expo-crypto-shim.mjs')).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'expo-crypto') {
      return { url: cryptoShimUrl, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

const database = await import(pathToFileURL(path.join(projectRoot, 'database', 'database.ts')).href);
const { createTestDatabase } = await import(pathToFileURL(path.join(projectRoot, 'test-utils', 'sqlite.ts')).href);

for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(outputFile + suffix, { force: true });
}

const { db, raw } = createTestDatabase(outputFile);
await database.initializeDatabase(db);

const khim = await database.registerOwner(db, {
  fullName: 'Khim Sample',
  email: 'khim@pawfriends.test',
  password: SAMPLE_PASSWORD,
});
const sam = await database.registerOwner(db, {
  fullName: 'Sam Rivera',
  email: 'sam@pawfriends.test',
  password: SAMPLE_PASSWORD,
});

const mochi = await database.addPet(db, khim.id, {
  name: 'Mochi',
  species: 'Dog',
  breed: 'Shih Tzu',
  birthday: '2022-05-14',
  photoUri: null,
});
const luna = await database.addPet(db, khim.id, {
  name: 'Luna',
  species: 'Cat',
  breed: null,
  birthday: '2023-01-08',
  photoUri: null,
});
const peanut = await database.addPet(db, sam.id, {
  name: 'Peanut',
  species: 'Rabbit',
  breed: 'Holland Lop',
  birthday: null,
  photoUri: null,
});

const zoomies = await database.addPost(db, khim.id, {
  petId: mochi,
  caption: 'Sunday zoomies in the garden! Found a butterfly and lost it completely.',
  photoUri: null,
});
const loaf = await database.addPost(db, khim.id, {
  petId: luna,
  caption: 'Loaf mode: activated. Luna refuses to leave her sunny spot.',
  photoUri: null,
});
const grass = await database.addPost(db, sam.id, {
  petId: peanut,
  caption: 'First time in the garden. Peanut approved every single blade of grass.',
  photoUri: null,
});
await database.addPost(db, sam.id, { petId: null, caption: 'Any tips for a first-time bunny owner?', photoUri: null });

await database.toggleLike(db, sam.id, zoomies);
await database.toggleLike(db, khim.id, grass);
await database.toggleLike(db, sam.id, loaf);
await database.toggleSave(db, khim.id, grass);
await database.addComment(db, sam.id, zoomies, 'Mochi is the cutest!');
await database.addComment(db, khim.id, zoomies, 'Thank you! She slept for hours after.');
await database.addComment(db, khim.id, grass, 'Peanut looks so happy.');

const counts = ['owners', 'pets', 'posts', 'post_likes', 'post_saves', 'comments']
  .map((table) => `${table}: ${raw.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count}`)
  .join(', ');

// Fold the write-ahead log into the main file so viewers see everything in one .db file.
raw.exec('PRAGMA wal_checkpoint(TRUNCATE); PRAGMA journal_mode = DELETE;');
raw.close();

console.log(`Created ${path.relative(projectRoot, outputFile)} (${counts})`);
