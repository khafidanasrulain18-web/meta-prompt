// src/lib/mongodb.ts
//
// Koneksi MongoDB yang di-cache. Di development, Next.js melakukan hot-reload
// modul secara berulang — tanpa caching di `global`, ini akan membuka koneksi
// baru setiap kali file disimpan. Pola ini adalah rekomendasi resmi MongoDB
// untuk Next.js.
//
// Koneksi baru sengaja TIDAK dibuat saat module ini di-import (misalnya saat
// `next build` memuat setiap route untuk manifest), tapi baru saat getDb()
// benar-benar dipanggil — supaya build tidak gagal hanya karena MONGODB_URI
// belum diset.

import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cachedClientPromise: Promise<MongoClient> | undefined;

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI belum diset. Tambahkan MONGODB_URI di .env.local (lihat .env.local.example).'
    );
  }

  const client = new MongoClient(uri);

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  // Production/serverless: satu instance per proses (module ini di-cache
  // oleh Node module cache selama proses hidup).
  return client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!cachedClientPromise) {
    cachedClientPromise = createClientPromise();
  }
  return cachedClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'prompt_studio';
  return client.db(dbName);
}
