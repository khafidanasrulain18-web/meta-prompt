// src/lib/models/prompt.ts
//
// Menggantikan riwayat prompt yang sebelumnya disimpan di localStorage
// (per-browser, hilang kalau ganti device / clear data) dengan koleksi
// MongoDB `prompts` yang terikat ke userId dari sesi login.

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export interface PromptDoc {
  userId: string;
  templateId: string;
  templateName: string;
  category: string;
  icon: string;
  color: string;
  values: Record<string, string | number>;
  result: string;
  createdAt: Date;
  isFavorite?: boolean;
  notes?: string;
}

export interface PromptPublic {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  icon: string;
  color: string;
  values: Record<string, string | number>;
  result: string;
  createdAt: string;
  isFavorite?: boolean;
  notes?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _promptStudioPromptIndexEnsured: boolean | undefined;
}

async function getPromptsCollection() {
  const db = await getDb();
  const collection = db.collection<PromptDoc>('prompts');

  if (!global._promptStudioPromptIndexEnsured) {
    await collection.createIndex({ userId: 1, createdAt: -1 });
    global._promptStudioPromptIndexEnsured = true;
  }

  return collection;
}

function toPublic(doc: PromptDoc & { _id: ObjectId }): PromptPublic {
  return {
    id: doc._id.toString(),
    templateId: doc.templateId,
    templateName: doc.templateName,
    category: doc.category,
    icon: doc.icon,
    color: doc.color,
    values: doc.values,
    result: doc.result,
    createdAt: doc.createdAt.toISOString(),
    isFavorite: doc.isFavorite,
    notes: doc.notes,
  };
}

export async function listPromptsForUser(userId: string): Promise<PromptPublic[]> {
  const prompts = await getPromptsCollection();
  const docs = await prompts.find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs.map(toPublic);
}

export async function createPromptForUser(
  userId: string,
  data: Omit<PromptPublic, 'id' | 'createdAt' | 'isFavorite'>
): Promise<PromptPublic> {
  const prompts = await getPromptsCollection();
  const doc: PromptDoc = {
    userId,
    templateId: data.templateId,
    templateName: data.templateName,
    category: data.category,
    icon: data.icon,
    color: data.color,
    values: data.values,
    result: data.result,
    createdAt: new Date(),
  };
  const result = await prompts.insertOne(doc);
  return toPublic({ ...doc, _id: result.insertedId });
}

export async function deletePromptForUser(userId: string, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const prompts = await getPromptsCollection();
  const result = await prompts.deleteOne({ _id: new ObjectId(id), userId });
  return result.deletedCount > 0;
}

export async function setPromptFavorite(
  userId: string,
  id: string,
  isFavorite: boolean
): Promise<PromptPublic | null> {
  if (!ObjectId.isValid(id)) return null;
  const prompts = await getPromptsCollection();
  const result = await prompts.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { isFavorite } },
    { returnDocument: 'after' }
  );
  return result ? toPublic(result) : null;
}
