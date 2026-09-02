// src/lib/models/user.ts
//
// Menggantikan `global.users` (in-memory) dengan koleksi MongoDB `users`.

import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';

export interface UserDoc {
  email: string; // selalu disimpan lowercase
  password: string; // hash bcrypt
  name: string;
  createdAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _promptStudioIndexesEnsured: boolean | undefined;
  // eslint-disable-next-line no-var
  var _promptStudioDefaultAdminEnsured: boolean | undefined;
}

async function getUsersCollection() {
  const db = await getDb();
  const collection = db.collection<UserDoc>('users');

  // Idempotent — aman dipanggil berkali-kali. Hanya benar-benar membuat
  // index sekali per proses server berkat flag di `global`.
  if (!global._promptStudioIndexesEnsured) {
    await collection.createIndex({ email: 1 }, { unique: true });
    global._promptStudioIndexesEnsured = true;
  }

  return collection;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublic(doc: UserDoc & { _id: any }): UserPublic {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function findUserByEmail(email: string) {
  const users = await getUsersCollection();
  return users.findOne({ email: normalizeEmail(email) });
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string; // plain text, akan di-hash di sini
}): Promise<UserPublic> {
  const users = await getUsersCollection();
  const normalizedEmail = normalizeEmail(params.email);

  const hashedPassword = await bcrypt.hash(params.password, 10);
  const doc: UserDoc = {
    email: normalizedEmail,
    password: hashedPassword,
    name: params.name,
    createdAt: new Date(),
  };

  const result = await users.insertOne(doc);
  return toPublic({ ...doc, _id: result.insertedId });
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  const users = await getUsersCollection();
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const result = await users.updateOne(
    { email: normalizeEmail(email) },
    { $set: { password: hashedPassword } }
  );
  return result.matchedCount > 0;
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// Akun demo default supaya aplikasi tetap bisa langsung dicoba tanpa
// perlu register dulu. Hanya dibuat sekali jika koleksi users kosong.
export async function ensureDefaultAdmin(): Promise<void> {
  if (global._promptStudioDefaultAdminEnsured) return;

  const users = await getUsersCollection();
  const existing = await users.findOne({ email: 'admin@promptstudio.com' });
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await users.insertOne({
      email: 'admin@promptstudio.com',
      password: hashedPassword,
      name: 'Admin Prompt Studio',
      createdAt: new Date(),
    });
  }
  global._promptStudioDefaultAdminEnsured = true;
}
