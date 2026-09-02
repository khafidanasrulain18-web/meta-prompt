// src/lib/storage.ts
//
// Sebelumnya riwayat prompt disimpan di localStorage (per-browser, hilang
// kalau pindah device atau clear data). Sekarang disimpan di MongoDB lewat
// /api/history, terikat ke akun yang sedang login (lihat middleware.ts —
// semua halaman yang memakai fungsi ini sudah dilindungi butuh login).

import { SavedPrompt } from '@/types/template';

async function parseJsonSafe(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getHistory(): Promise<SavedPrompt[]> {
  try {
    const res = await fetch('/api/history');
    const data = await parseJsonSafe(res);
    if (!res.ok || !data) {
      console.error('Gagal memuat riwayat:', data?.error);
      return [];
    }
    return Array.isArray(data.items) ? data.items : [];
  } catch (error) {
    console.error('Error memuat riwayat:', error);
    return [];
  }
}

export async function saveToHistory(
  prompt: Omit<SavedPrompt, 'id' | 'createdAt'>
): Promise<SavedPrompt | null> {
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok || !data?.item) {
      console.error('Gagal menyimpan ke riwayat:', data?.error);
      return null;
    }
    return data.item as SavedPrompt;
  } catch (error) {
    console.error('Error menyimpan ke riwayat:', error);
    return null;
  }
}

export async function deleteFromHistory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error('Error menghapus riwayat:', error);
    return false;
  }
}

export async function setFavorite(id: string, isFavorite: boolean): Promise<SavedPrompt | null> {
  try {
    const res = await fetch(`/api/history/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite }),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok || !data?.item) {
      console.error('Gagal mengubah favorit:', data?.error);
      return null;
    }
    return data.item as SavedPrompt;
  } catch (error) {
    console.error('Error mengubah favorit:', error);
    return null;
  }
}
