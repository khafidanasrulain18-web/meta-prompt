// src/lib/models/resetToken.ts
//
// Menggantikan `global.resetTokens` (in-memory) dengan koleksi MongoDB
// `resetTokens`, lengkap dengan TTL index supaya token kedaluwarsa
// otomatis terhapus oleh MongoDB sendiri — tidak perlu cron/cleanup manual.

import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { normalizeEmail } from '@/lib/models/user';

export interface ResetTokenDoc {
  email: string;
  token: string;
  expiresAt: Date;
}

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 menit

declare global {
  // eslint-disable-next-line no-var
  var _promptStudioResetTokenIndexEnsured: boolean | undefined;
}

async function getResetTokensCollection() {
  const db = await getDb();
  const collection = db.collection<ResetTokenDoc>('resetTokens');

  if (!global._promptStudioResetTokenIndexEnsured) {
    // TTL index: dokumen otomatis dihapus MongoDB begitu expiresAt terlewati.
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await collection.createIndex({ email: 1, token: 1 });
    global._promptStudioResetTokenIndexEnsured = true;
  }

  return collection;
}

export async function createResetToken(email: string): Promise<string> {
  const tokens = await getResetTokensCollection();
  const normalizedEmail = normalizeEmail(email);

  // Hapus token lama milik email ini supaya cuma satu token aktif berlaku.
  await tokens.deleteMany({ email: normalizedEmail });

  const token = crypto.randomBytes(16).toString('hex');
  await tokens.insertOne({
    email: normalizedEmail,
    token,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  return token;
}

export async function consumeResetToken(email: string, token: string): Promise<boolean> {
  const tokens = await getResetTokensCollection();
  const normalizedEmail = normalizeEmail(email);

  const entry = await tokens.findOne({ email: normalizedEmail, token });
  if (!entry) return false;
  if (entry.expiresAt.getTime() < Date.now()) {
    await tokens.deleteOne({ _id: entry._id });
    return false;
  }

  // Token sekali pakai
  await tokens.deleteOne({ _id: entry._id });
  return true;
}
