'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedPrompt } from '@/types/template';
import { saveToHistory } from '@/lib/storage';
import PageTransition from '@/components/PageTransition';

export default function ResultPage() {
  const router = useRouter();
  const [promptData, setPromptData] = useState<SavedPrompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil data dari sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('promptResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPromptData(parsed);
      } catch {
        // data rusak
      }
    }
    setLoading(false);
  }, []);

  // Jika tidak ada data, redirect ke home
  useEffect(() => {
    if (!loading && !promptData) {
      router.push('/');
    }
  }, [loading, promptData, router]);

  const handleCopy = async () => {
    if (!promptData) return;
    try {
      await navigator.clipboard.writeText(promptData.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = promptData.result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!promptData || promptData.id) return;
    const savedEntry = await saveToHistory({
      templateId: promptData.templateId,
      templateName: promptData.templateName,
      category: promptData.category,
      icon: promptData.icon,
      color: promptData.color,
      values: promptData.values || {},
      result: promptData.result,
    });
    if (!savedEntry) {
      alert('Gagal menyimpan ke riwayat. Coba lagi.');
      return;
    }
    setSaved(true);
    setPromptData({ ...promptData, id: savedEntry.id, createdAt: savedEntry.createdAt });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = () => {
    if (!promptData) return;
    sessionStorage.setItem('editValues', JSON.stringify(promptData.values));
    router.push(`/builder/${promptData.templateId}`);
  };

  const handleNew = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-spin">⏳</div>
      </div>
    );
  }

  if (!promptData) return null;

  const { result, templateName, icon, color, category } = promptData;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="text-2xl hover:opacity-70">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>{icon}</span> {templateName}
            </h1>
            <p className="text-sm text-gray-500">{category}</p>
          </div>
        </div>

        {/* Result card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold text-gray-700">✨ Hasil Prompt</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? '✅ Tersalin' : '📋 Copy'}
              </button>
              <button
                onClick={handleSave}
                disabled={!!promptData.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  saved || promptData.id ? 'bg-blue-100 text-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {saved || promptData.id ? '💾 Tersimpan' : '💾 Simpan'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
              {result}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={handleEdit} className="flex-1 px-6 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            ✏️ Edit
          </button>
          <button onClick={handleNew} className="flex-1 px-6 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            🏠 Buat Baru
          </button>
        </div>

        {/* Toast notification */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg"
            >
              ✅ Prompt tersimpan di riwayat!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}