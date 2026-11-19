// Stands in for expo-crypto (a native module) when database/database.ts runs in Node.
import { createHash, randomBytes } from 'node:crypto';

export const CryptoDigestAlgorithm = { SHA512: 'SHA-512' };

export async function getRandomBytesAsync(count) {
  return new Uint8Array(randomBytes(count));
}

export async function digestStringAsync(_algorithm, data) {
  return createHash('sha512').update(data).digest('hex');
}
