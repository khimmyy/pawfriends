import type { SQLiteDatabase } from 'expo-sqlite';
import type { DatabaseSync, SQLInputValue } from 'node:sqlite';

// Loaded through getBuiltinModule because Jest's resolver does not know about `node:sqlite`.
const { DatabaseSync: NodeDatabase } = process.getBuiltinModule('node:sqlite');

/**
 * An in-memory SQLite database that implements the parts of expo-sqlite's
 * SQLiteDatabase API used by database/database.ts. It runs the real SQL, so
 * migrations and queries are checked by an actual SQLite engine.
 */
export function createTestDatabase(): { db: SQLiteDatabase; raw: DatabaseSync } {
  const raw = new NodeDatabase(':memory:');

  // expo-sqlite accepts parameters either as separate arguments or as one array.
  const toParams = (params: unknown[]) =>
    (params.length === 1 && Array.isArray(params[0]) ? params[0] : params) as SQLInputValue[];

  const db = {
    execAsync: async (source: string) => {
      raw.exec(source);
    },
    getFirstAsync: async (source: string, ...params: unknown[]) =>
      raw.prepare(source).get(...toParams(params)) ?? null,
    getAllAsync: async (source: string, ...params: unknown[]) =>
      raw.prepare(source).all(...toParams(params)),
    runAsync: async (source: string, ...params: unknown[]) => {
      const result = raw.prepare(source).run(...toParams(params));
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    withTransactionAsync: async (task: () => Promise<void>) => {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return { db: db as unknown as SQLiteDatabase, raw };
}

export function tableNames(raw: DatabaseSync): string[] {
  return raw
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((row: Record<string, unknown>) => String(row.name));
}

export function userVersion(raw: DatabaseSync): number {
  return Number(raw.prepare('PRAGMA user_version').get()?.user_version);
}
