// src/app/ai-generate/[id]/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { getTemplateById } from '@/data/templates';
import { generatePromptFromDescription } from '@/lib/deepseek';
import { saveToHistory } from '@/lib/storage';

export default function AIGeneratePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const template = useMemo(() => getTemplateById(params.id), [params.id]);
  if (!template) notFound();

  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string | number> | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasSavedCurrentResult, setHasSavedCurrentResult] = useState(false);

  // ============================================================
  // HANDLE GENERATE
  // ============================================================
  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Masukkan deskripsi prompt terlebih dahulu!');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setValues(null);
    setHasSavedCurrentResult(false);

    try {
      const filledValues = await generatePromptFromDescription(
        template.id,
        template.name,
        template.category,
        template.fields,
        description
      );

      setValues(filledValues);

      // Generate prompt final
      const promptResult = template.promptTemplate(filledValues);
      setResult(promptResult);
    } catch (error) {
      console.error(error);
      alert('Gagal generate dengan AI. Periksa console.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================
  // HANDLE COPY
  // ============================================================
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ============================================================
  // HANDLE SAVE
  // ============================================================
  const handleSave = async () => {
    if (!result || !values || hasSavedCurrentResult) return;
    const savedEntry = await saveToHistory({
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      icon: template.icon,
      color: template.color,
      values: values,
      result: result,
    });
    if (!savedEntry) {
      alert('Gagal menyimpan ke riwayat. Coba lagi.');
      return;
    }
    setHasSavedCurrentResult(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ============================================================
  // HANDLE EDIT (ke builder manual)
  // ============================================================
  const handleEdit = () => {
    if (values) {
      sessionStorage.setItem('editValues', JSON.stringify(values));
      router.push(`/builder/${template.id}`);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="text-2xl hover:opacity-70">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{template.icon}</span> {template.name}
          </h1>
          <p className="text-sm text-gray-500">AI Generate — {template.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== FORM ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Deskripsikan Prompt yang Kamu Inginkan</h2>
          <p className="text-sm text-gray-500 mb-4">
            Tuliskan secara singkat apa yang ingin kamu buat, AI akan mengisi semua field secara otomatis.
          </p>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Tulis artikel tentang manfaat AI di bidang pendidikan untuk orang tua..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all resize-none"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-4 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '⏳ AI sedang berpikir...' : '✨ Generate dengan AI'}
          </button>

          <div className="mt-4 text-xs text-gray-400 text-center">
            {template.fields.length} field akan diisi otomatis
          </div>
        </div>

        {/* ===== RESULT ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📝</span> Hasil Prompt
            {result && (
              <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">Siap</span>
            )}
          </h2>

          {result ? (
            <>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[200px]">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {result}
                </pre>
              </div>

              {/* Aksi */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCopy}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? '✅ Tersalin' : '📋 Copy'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={hasSavedCurrentResult}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    saved || hasSavedCurrentResult
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {saved || hasSavedCurrentResult ? '💾 Tersimpan' : '💾 Simpan'}
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-gray-400">
              <div className="text-4xl mb-4">✨</div>
              <p>Ketik deskripsi di sebelah kiri,<br />lalu klik Generate dengan AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}