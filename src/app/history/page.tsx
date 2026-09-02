'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getHistory, deleteFromHistory, setFavorite } from '@/lib/storage';
import { SavedPrompt } from '@/types/template';

// === Memoized History Card ===
const HistoryCard = memo(function HistoryCard({
  item,
  onDelete,
  onCopy,
  onToggleFavorite,
  onDuplicate,
}: {
  item: SavedPrompt;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  onToggleFavorite: (id: string, nextValue: boolean) => void;
  onDuplicate: (item: SavedPrompt) => void;
}) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.templateName}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
            {item.isFavorite && <span>⭐</span>}
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {item.result.length > 120 ? `${item.result.slice(0, 120)}...` : item.result}
          </p>
          <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleFavorite(item.id, !item.isFavorite)}
            className="text-lg hover:scale-110 transition"
          >
            {item.isFavorite ? '⭐' : '☆'}
          </button>
          <button onClick={() => onCopy(item.result)} className="text-gray-400 hover:text-gray-700">
            📋
          </button>
          <button onClick={() => onDuplicate(item)} className="text-gray-400 hover:text-gray-700">
            🔄
          </button>
          <button
            onClick={() => router.push(`/builder/${item.templateId}`)}
            className="text-gray-400 hover:text-gray-700"
          >
            ✏️
          </button>
          <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
});

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm('Hapus prompt ini?')) {
        await deleteFromHistory(id);
        loadHistory();
      }
    },
    [loadHistory]
  );

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert('✅ Prompt tersalin!');
  }, []);

  const handleToggleFavorite = useCallback(
    async (id: string, nextValue: boolean) => {
      await setFavorite(id, nextValue);
      loadHistory();
    },
    [loadHistory]
  );

  const handleDuplicate = useCallback(
    (item: SavedPrompt) => {
      sessionStorage.setItem('editValues', JSON.stringify(item.values));
      router.push(`/builder/${item.templateId}`);
    },
    [router]
  );

  if (loading) {
    return <div className="text-center py-20">⏳ Memuat...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-semibold text-gray-700">Belum ada riwayat</h2>
        <p className="text-gray-400 mt-2">Mulai buat prompt dan simpan hasilnya di sini.</p>
        <Link href="/" className="mt-6 inline-block btn-apple-primary">
          🚀 Buat Prompt Pertama
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📜 Riwayat Prompt</h1>
      <div className="space-y-4">
        {history.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onToggleFavorite={handleToggleFavorite}
            onDuplicate={handleDuplicate}
          />
        ))}
      </div>
    </div>
  );
}