import {
  addComment,
  addPet,
  addPost,
  clearSession,
  getComments,
  getFeedPosts,
  getPet,
  getPetsForOwner,
  getPost,
  getSessionOwner,
  initializeDatabase,
  MAX_COMMENT_LENGTH,
  registerOwner,
  saveSession,
  toggleLike,
  toggleSave,
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

const LATEST_VERSION = 5;

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

    expect(tableNames(raw)).toEqual(expect.arrayContaining(['comments', 'owners', 'pets', 'post_likes', 'post_saves', 'posts', 'session']));
    expect(userVersion(raw)).toBe(LATEST_VERSION);
  });

  it('adds the pets and posts tables to an existing version 2 install', async () => {
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

    expect(tableNames(raw)).toEqual(expect.arrayContaining(['comments', 'pets', 'post_likes', 'post_saves', 'posts']));
    expect(userVersion(raw)).toBe(LATEST_VERSION);
  });

  it('adds the posts table to an existing version 3 install and keeps its pets', async () => {
    const { db, raw } = await freshDatabase();
    const owner = await registerOwner(db, { fullName: 'Khim', email: 'khim@example.com', password: 'password-1' });
    const petId = await addPet(db, owner.id, MOCHI);
    // Turn this back into what a phone had before the posts feature.
    raw.exec('DROP TABLE posts; PRAGMA user_version = 3;');

    await initializeDatabase(db);

    expect(tableNames(raw)).toContain('posts');
    expect(userVersion(raw)).toBe(LATEST_VERSION);
    await expect(getPet(db, owner.id, petId)).resolves.toMatchObject({ name: 'Mochi' });
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

describe('posts', () => {
  async function databaseWithOwnerAndPet() {
    const test = await freshDatabase();
    const khim = await registerOwner(test.db, { fullName: 'Khim Test', email: 'khim@example.com', password: 'password-1' });
    const sam = await registerOwner(test.db, { fullName: 'Sam', email: 'sam@example.com', password: 'password-2' });
    const mochiId = await addPet(test.db, khim.id, MOCHI);
    return { ...test, khim, sam, mochiId };
  }

  it('starts with an empty feed', async () => {
    const { db } = await freshDatabase();

    await expect(getFeedPosts(db, 1)).resolves.toEqual([]);
  });

  it('saves a post about a pet and shows it with the pet and owner names', async () => {
    const { db, khim, mochiId } = await databaseWithOwnerAndPet();

    const postId = await addPost(db, khim.id, {
      petId: mochiId,
      caption: 'Zoomies in the garden!',
      photoUri: 'file:///post-photos/zoomies.jpg',
    });

    const [post] = await getFeedPosts(db, khim.id);
    expect(post).toMatchObject({
      id: postId,
      ownerId: khim.id,
      ownerName: 'Khim Test',
      ownerEmail: 'khim@example.com',
      petId: mochiId,
      petName: 'Mochi',
      petPhotoUri: MOCHI.photoUri,
      caption: 'Zoomies in the garden!',
      photoUri: 'file:///post-photos/zoomies.jpg',
    });
    expect(post.createdAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('saves a post with no pet and no photo', async () => {
    const { db, khim } = await databaseWithOwnerAndPet();

    await addPost(db, khim.id, { petId: null, caption: 'Hello PawFriends', photoUri: null });

    await expect(getFeedPosts(db, khim.id)).resolves.toEqual([
      expect.objectContaining({ petId: null, petName: null, petPhotoUri: null, photoUri: null }),
    ]);
  });

  it('lists the newest posts first', async () => {
    const { db, khim, sam } = await databaseWithOwnerAndPet();
    await addPost(db, khim.id, { petId: null, caption: 'first', photoUri: null });
    await addPost(db, sam.id, { petId: null, caption: 'second', photoUri: null });
    await addPost(db, khim.id, { petId: null, caption: 'third', photoUri: null });

    const captions = (await getFeedPosts(db, khim.id)).map((post) => post.caption);

    expect(captions).toEqual(['third', 'second', 'first']);
  });

  it('returns at most the requested number of posts', async () => {
    const { db, khim } = await databaseWithOwnerAndPet();
    for (const caption of ['a', 'b', 'c']) {
      await addPost(db, khim.id, { petId: null, caption, photoUri: null });
    }

    await expect(getFeedPosts(db, khim.id, { limit: 2 })).resolves.toHaveLength(2);
  });

  it('refuses to tag another owner’s pet', async () => {
    const { db, sam, mochiId } = await databaseWithOwnerAndPet();

    await expect(addPost(db, sam.id, { petId: mochiId, caption: 'Not my pet', photoUri: null })).rejects.toThrow(
      'That pet does not belong to this owner.'
    );
    await expect(getFeedPosts(db, sam.id)).resolves.toEqual([]);
  });

  it('keeps a post when its pet is deleted', async () => {
    const { db, raw, khim, mochiId } = await databaseWithOwnerAndPet();
    await addPost(db, khim.id, { petId: mochiId, caption: 'Remember Mochi', photoUri: null });

    raw.prepare('DELETE FROM pets WHERE id = ?').run(mochiId);

    await expect(getFeedPosts(db, khim.id)).resolves.toEqual([
      expect.objectContaining({ caption: 'Remember Mochi', petId: null, petName: null }),
    ]);
  });

  it('removes an owner’s posts when the owner is deleted', async () => {
    const { db, raw, khim, sam } = await databaseWithOwnerAndPet();
    await addPost(db, khim.id, { petId: null, caption: 'from Khim', photoUri: null });
    await addPost(db, sam.id, { petId: null, caption: 'from Sam', photoUri: null });

    raw.prepare('DELETE FROM owners WHERE id = ?').run(khim.id);

    const captions = (await getFeedPosts(db, sam.id)).map((post) => post.caption);
    expect(captions).toEqual(['from Sam']);
  });
});

describe('likes, saves, comments and search', () => {
  async function databaseWithPosts() {
    const test = await freshDatabase();
    const khim = await registerOwner(test.db, { fullName: 'Khim Test', email: 'khim@example.com', password: 'password-1' });
    const sam = await registerOwner(test.db, { fullName: 'Sam Rivera', email: 'sam@example.com', password: 'password-2' });
    const mochiId = await addPet(test.db, khim.id, MOCHI);
    const mochiPost = await addPost(test.db, khim.id, { petId: mochiId, caption: 'Zoomies in the garden', photoUri: null });
    const samPost = await addPost(test.db, sam.id, { petId: null, caption: 'Rainy day naps', photoUri: null });
    return { ...test, khim, sam, mochiPost, samPost };
  }

  it('adds the like, save and comment tables to an existing version 4 install and keeps its posts', async () => {
    const { db, raw, khim, mochiPost } = await databaseWithPosts();
    raw.exec('DROP TABLE post_likes; DROP TABLE post_saves; DROP TABLE comments; PRAGMA user_version = 4;');

    await initializeDatabase(db);

    expect(tableNames(raw)).toEqual(expect.arrayContaining(['comments', 'post_likes', 'post_saves']));
    expect(userVersion(raw)).toBe(LATEST_VERSION);
    await expect(getPost(db, khim.id, mochiPost)).resolves.toMatchObject({ caption: 'Zoomies in the garden' });
  });

  it('starts a post with no likes, comments or saves', async () => {
    const { db, khim, mochiPost } = await databaseWithPosts();

    await expect(getPost(db, khim.id, mochiPost)).resolves.toMatchObject({
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      savedByMe: false,
    });
  });

  it('likes and unlikes a post, counting each owner once', async () => {
    const { db, khim, sam, mochiPost } = await databaseWithPosts();

    await expect(toggleLike(db, khim.id, mochiPost)).resolves.toEqual({ liked: true, likeCount: 1 });
    await expect(toggleLike(db, sam.id, mochiPost)).resolves.toEqual({ liked: true, likeCount: 2 });
    await expect(toggleLike(db, khim.id, mochiPost)).resolves.toEqual({ liked: false, likeCount: 1 });

    await expect(getPost(db, khim.id, mochiPost)).resolves.toMatchObject({ likeCount: 1, likedByMe: false });
    await expect(getPost(db, sam.id, mochiPost)).resolves.toMatchObject({ likeCount: 1, likedByMe: true });
  });

  it('saves and unsaves a post for one owner only', async () => {
    const { db, khim, sam, mochiPost, samPost } = await databaseWithPosts();

    await expect(toggleSave(db, khim.id, samPost)).resolves.toBe(true);

    await expect(getPost(db, khim.id, samPost)).resolves.toMatchObject({ savedByMe: true });
    await expect(getPost(db, sam.id, samPost)).resolves.toMatchObject({ savedByMe: false });
    expect((await getFeedPosts(db, khim.id, { savedOnly: true })).map((post) => post.id)).toEqual([samPost]);
    await expect(getFeedPosts(db, sam.id, { savedOnly: true })).resolves.toEqual([]);

    await expect(toggleSave(db, khim.id, samPost)).resolves.toBe(false);
    await expect(getFeedPosts(db, khim.id, { savedOnly: true })).resolves.toEqual([]);
    await expect(getPost(db, khim.id, mochiPost)).resolves.toMatchObject({ savedByMe: false });
  });

  it('adds comments, oldest first, with the commenter’s name', async () => {
    const { db, khim, sam, mochiPost } = await databaseWithPosts();

    await addComment(db, sam.id, mochiPost, '  So cute!  ');
    await addComment(db, khim.id, mochiPost, 'Thank you!');

    const comments = await getComments(db, mochiPost);
    expect(comments.map((comment) => [comment.ownerName, comment.body])).toEqual([
      ['Sam Rivera', 'So cute!'],
      ['Khim Test', 'Thank you!'],
    ]);
    await expect(getPost(db, khim.id, mochiPost)).resolves.toMatchObject({ commentCount: 2 });
    await expect(getComments(db, 9999)).resolves.toEqual([]);
  });

  it('rejects empty and too-long comments', async () => {
    const { db, khim, mochiPost } = await databaseWithPosts();

    await expect(addComment(db, khim.id, mochiPost, '   ')).rejects.toThrow('A comment cannot be empty.');
    await expect(addComment(db, khim.id, mochiPost, 'a'.repeat(MAX_COMMENT_LENGTH + 1))).rejects.toThrow(
      `A comment can be at most ${MAX_COMMENT_LENGTH} characters.`
    );
    await expect(addComment(db, khim.id, mochiPost, 'a'.repeat(MAX_COMMENT_LENGTH))).resolves.toEqual(
      expect.any(Number)
    );
  });

  it('removes a post’s likes, saves and comments when its owner is deleted', async () => {
    const { db, raw, khim, sam, mochiPost } = await databaseWithPosts();
    await toggleLike(db, sam.id, mochiPost);
    await toggleSave(db, sam.id, mochiPost);
    await addComment(db, sam.id, mochiPost, 'Love this');

    raw.prepare('DELETE FROM owners WHERE id = ?').run(khim.id);

    const count = (table: string) => Number(raw.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count);
    expect([count('post_likes'), count('post_saves'), count('comments')]).toEqual([0, 0, 0]);
  });

  it.each([
    ['a word in the caption', 'zoomies', ['Zoomies in the garden']],
    ['different letter case', 'RAINY', ['Rainy day naps']],
    ['a pet name', 'mochi', ['Zoomies in the garden']],
    ['an owner name', 'rivera', ['Rainy day naps']],
    ['text that matches nothing', 'parrot', []],
  ])('searches by %s', async (_label, search, expectedCaptions) => {
    const { db, khim } = await databaseWithPosts();

    const results = await getFeedPosts(db, khim.id, { search });

    expect(results.map((post) => post.caption)).toEqual(expectedCaptions);
  });

  it('treats % and _ in a search as plain characters', async () => {
    const { db, khim } = await databaseWithPosts();
    await addPost(db, khim.id, { petId: null, caption: '100% good boy', photoUri: null });

    expect((await getFeedPosts(db, khim.id, { search: '0%' })).map((post) => post.caption)).toEqual(['100% good boy']);
    await expect(getFeedPosts(db, khim.id, { search: '_' })).resolves.toEqual([]);
  });

  it('ignores a search of only spaces', async () => {
    const { db, khim } = await databaseWithPosts();

    await expect(getFeedPosts(db, khim.id, { search: '   ' })).resolves.toHaveLength(2);
  });
});
