import {
  addPet,
  clearSession,
  getPet,
  getPetsForOwner,
  getSessionOwner,
  initializeDatabase,
  registerOwner,
  saveSession,
  updatePet,
  verifyOwner,
  type PetInput,
} from '@/database/database';
import { createTestDatabase, tableNames, userVersion } from '@/test-utils/sqlite';

// expo-crypto is a native module, so back it with Node's crypto in tests.
jest.mock('expo-crypto', () => {
  const nodeCrypto = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    CryptoDigestAlgorithm: { SHA512: 'SHA-512' },
    getRandomBytesAsync: async (count: number) => new Uint8Array(nodeCrypto.randomBytes(count)),
    digestStringAsync: async (_algorithm: string, data: string) =>
      nodeCrypto.createHash('sha512').update(data).digest('hex'),
  };
});

const LATEST_VERSION = 3;

async function freshDatabase() {
  const test = createTestDatabase();
  await initializeDatabase(test.db);
  return test;
}

const MOCHI: PetInput = {
  name: 'Mochi',
  species: 'Dog',
  breed: 'Shih Tzu',
  birthday: '2022-05-14',
  photoUri: 'file:///pet-photos/mochi.jpg',
};

describe('initializeDatabase', () => {
  it('creates every table on a fresh install', async () => {
    const { raw } = await freshDatabase();

    expect(tableNames(raw)).toEqual(expect.arrayContaining(['owners', 'pets', 'session']));
    expect(userVersion(raw)).toBe(LATEST_VERSION);
  });

  it('adds the pets table to an existing version 2 install', async () => {
    const { db, raw } = createTestDatabase();
    // What a phone that installed the app before the pets feature already has.
    raw.exec(`
      CREATE TABLE owners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      PRAGMA user_version = 2;
    `);

    await initializeDatabase(db);

    expect(tableNames(raw)).toContain('pets');
    expect(userVersion(raw)).toBe(LATEST_VERSION);
  });

  it('can run again on every launch without failing', async () => {
    const { db } = await freshDatabase();

    await expect(initializeDatabase(db)).resolves.toBeUndefined();
  });
});

describe('owners and sign-in', () => {
  it('registers an owner and signs them in with the right password only', async () => {
    const { db } = await freshDatabase();
    const owner = await registerOwner(db, {
      fullName: '  Khim Test  ',
      email: ' Khim@Example.com ',
      password: 'correct-horse',
    });

    expect(owner).toEqual({ id: owner.id, fullName: 'Khim Test', email: 'khim@example.com' });
    await expect(verifyOwner(db, 'KHIM@example.com', 'correct-horse')).resolves.toEqual(owner);
    await expect(verifyOwner(db, 'khim@example.com', 'wrong-password')).resolves.toBeNull();
    await expect(verifyOwner(db, 'nobody@example.com', 'correct-horse')).resolves.toBeNull();
  });

  it('never stores the plain password', async () => {
    const { db, raw } = await freshDatabase();
    await registerOwner(db, { fullName: 'Khim', email: 'khim@example.com', password: 'correct-horse' });

    const row = raw.prepare('SELECT * FROM owners').get();
    expect(JSON.stringify(row)).not.toContain('correct-horse');
  });

  it('rejects a second account with the same email', async () => {
    const { db } = await freshDatabase();
    await registerOwner(db, { fullName: 'Khim', email: 'khim@example.com', password: 'password-1' });

    await expect(
      registerOwner(db, { fullName: 'Other', email: 'KHIM@example.com', password: 'password-2' })
    ).rejects.toThrow('UNIQUE constraint failed');
  });

  it('saves, reads and clears the signed-in session', async () => {
    const { db } = await freshDatabase();
    const owner = await registerOwner(db, { fullName: 'Khim', email: 'khim@example.com', password: 'password-1' });

    await expect(getSessionOwner(db)).resolves.toBeNull();
    await saveSession(db, owner.id);
    await expect(getSessionOwner(db)).resolves.toEqual(owner);
    await clearSession(db);
    await expect(getSessionOwner(db)).resolves.toBeNull();
  });
});

describe('pets', () => {
  async function databaseWithTwoOwners() {
    const test = await freshDatabase();
    const khim = await registerOwner(test.db, { fullName: 'Khim', email: 'khim@example.com', password: 'password-1' });
    const sam = await registerOwner(test.db, { fullName: 'Sam', email: 'sam@example.com', password: 'password-2' });
    return { ...test, khim, sam };
  }

  it('adds a pet and reads it back', async () => {
    const { db, khim } = await databaseWithTwoOwners();

    const petId = await addPet(db, khim.id, MOCHI);

    await expect(getPet(db, khim.id, petId)).resolves.toEqual({ id: petId, ownerId: khim.id, ...MOCHI });
    await expect(getPetsForOwner(db, khim.id)).resolves.toHaveLength(1);
  });

  it('stores empty optional fields as null', async () => {
    const { db, khim } = await databaseWithTwoOwners();

    const petId = await addPet(db, khim.id, {
      name: 'Luna',
      species: 'Cat',
      breed: null,
      birthday: null,
      photoUri: null,
    });

    await expect(getPet(db, khim.id, petId)).resolves.toMatchObject({ breed: null, birthday: null, photoUri: null });
  });

  it('lists only the signed-in owner’s pets, oldest first', async () => {
    const { db, khim, sam } = await databaseWithTwoOwners();
    await addPet(db, khim.id, MOCHI);
    await addPet(db, sam.id, { ...MOCHI, name: 'Biscuit' });
    await addPet(db, khim.id, { ...MOCHI, name: 'Peanut', species: 'Rabbit' });

    const khimsPets = await getPetsForOwner(db, khim.id);

    expect(khimsPets.map((pet) => pet.name)).toEqual(['Mochi', 'Peanut']);
  });

  it('updates a pet', async () => {
    const { db, khim } = await databaseWithTwoOwners();
    const petId = await addPet(db, khim.id, MOCHI);

    await updatePet(db, khim.id, petId, { ...MOCHI, name: 'Mochi Jr.', breed: null });

    await expect(getPet(db, khim.id, petId)).resolves.toMatchObject({ name: 'Mochi Jr.', breed: null });
  });

  it('does not let another owner read or change a pet', async () => {
    const { db, khim, sam } = await databaseWithTwoOwners();
    const petId = await addPet(db, khim.id, MOCHI);

    await expect(getPet(db, sam.id, petId)).resolves.toBeNull();
    await updatePet(db, sam.id, petId, { ...MOCHI, name: 'Stolen' });
    await expect(getPet(db, khim.id, petId)).resolves.toMatchObject({ name: 'Mochi' });
  });

  it('removes an owner’s pets when the owner is deleted', async () => {
    const { db, raw, khim } = await databaseWithTwoOwners();
    await addPet(db, khim.id, MOCHI);

    raw.prepare('DELETE FROM owners WHERE id = ?').run(khim.id);

    await expect(getPetsForOwner(db, khim.id)).resolves.toEqual([]);
  });
});
