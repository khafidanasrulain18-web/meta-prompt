'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { TEMPLATES, getTemplateById } from '@/data/templates';
import { generatePromptFromDescription } from '@/lib/deepseek';
import Confetti from '@/components/Confetti';
import PageTransition from '@/components/PageTransition';

// Lazy load komponen berat (jika ada)
// const SomeHeavyComponent = lazy(() => import('@/components/Heavy'));

export default function BuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const template = useMemo(() => getTemplateById(params.id), [params.id]);
  if (!template) notFound();

  // ===== STATE =====
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // ===== LOAD SAVED VALUES =====
  useEffect(() => {
    const saved = sessionStorage.getItem('editValues');
    if (saved) {
      try {
        setFormValues(JSON.parse(saved));
        sessionStorage.removeItem('editValues');
      } catch {}
    }
  }, []);

  // ===== COMPUTED =====
  const totalFields = template.fields.length;
  const filledFields = template.fields.filter(f => formValues[f.id] && formValues[f.id] !== '').length;
  const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const livePrompt = useMemo(() => {
    try {
      return template.promptTemplate(formValues);
    } catch {
      return 'Isi field untuk melihat preview prompt...';
    }
  }, [formValues, template]);

  // ===== HANDLERS (dibungkus useCallback) =====
  const handleFieldChange = useCallback((fieldId: string, value: string | number) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  // ===== AI HELPER (isi field otomatis) =====
  const handleAIHelp = useCallback(async () => {
    const emptyFields = template.fields.filter(f => !formValues[f.id] || formValues[f.id] === '');
    if (emptyFields.length === 0) {
      alert('Semua field sudah terisi!');
      return;
    }

    const userPrompt = window.prompt(
      `Berikan deskripsi singkat tentang prompt yang ingin kamu buat.\n\nContoh: "Saya ingin menulis artikel tentang AI untuk pemula dengan gaya santai."\n\nDeskripsi:`
    );
    if (!userPrompt) return;

    setIsAIThinking(true);
    try {
      const result = await generatePromptFromDescription(
        template.id,
        template.name,
        template.category,
        template.fields,
        userPrompt
      );
      setFormValues(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.error(error);
      alert('Gagal mendapatkan saran AI. Periksa console.');
    } finally {
      setIsAIThinking(false);
    }
  }, [formValues, template]);

  // ===== SUBMIT (dipakai baik oleh form manual maupun AI generatif) =====
  const submitValues = useCallback(
    (vals: Record<string, string | number>) => {
      const errors: Record<string, string> = {};
      template.fields.forEach((field) => {
        if (field.required && !vals[field.id]) {
          errors[field.id] = `${field.label} wajib diisi`;
        }
      });

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        const firstErrorId = Object.keys(errors)[0];
        document.getElementById(`field-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }

      const result = template.promptTemplate(vals);
      if (!sessionStorage.getItem('hasGenerated')) {
        setShowConfetti(true);
        sessionStorage.setItem('hasGenerated', 'true');
      }

      sessionStorage.setItem(
        'promptResult',
        JSON.stringify({
          templateId: template.id,
          templateName: template.name,
          category: template.category,
          icon: template.icon,
          color: template.color,
          values: vals,
          result,
        })
      );

      setTimeout(() => {
        router.push('/result');
      }, 300);
      return true;
    },
    [template, router]
  );

  // ===== AI GENERATIF (langsung generate prompt) =====
  const handleAIGenerate = useCallback(async () => {
    const userPrompt = window.prompt(
      `Deskripsikan prompt yang ingin kamu buat.\n\nContoh: "Tulis artikel tentang manfaat AI di bidang pendidikan untuk orang tua."\n\nDeskripsi:`
    );
    if (!userPrompt) return;

    setIsAIGenerating(true);
    try {
      // Minta AI mengisi semua field
      const aiValues = await generatePromptFromDescription(
        template.id,
        template.name,
        template.category,
        template.fields,
        userPrompt
      );
      const mergedValues = { ...formValues, ...aiValues };
      setFormValues(mergedValues);

      // Langsung submit memakai nilai yang baru digabung — tanpa perlu
      // menunggu re-render atau mensimulasikan event submit DOM.
      submitValues(mergedValues);
    } catch (error) {
      console.error(error);
      alert('Gagal generate dengan AI. Periksa console.');
    } finally {
      setIsAIGenerating(false);
    }
  }, [template, formValues, submitValues]);

  // ===== SUBMIT (form manual) =====
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      submitValues(formValues);
      setIsSubmitting(false);
    },
    [formValues, submitValues]
  );

  // ===== RENDER FIELD (dengan memo) =====
  const renderField = useCallback(
    (field: any) => {
      const value = formValues[field.id] || field.defaultValue || '';
      const error = fieldErrors[field.id];
      return (
        <div key={field.id} id={`field-${field.id}`} className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all ${
                error ? 'border-red-300 ring-1 ring-red-300' : ''
              }`}
            />
          ) : field.type === 'select' ? (
            <select
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all ${
                error ? 'border-red-300 ring-1 ring-red-300' : ''
              }`}
            >
              <option value="">Pilih...</option>
              {field.options?.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) =>
                handleFieldChange(field.id, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)
              }
              placeholder={field.placeholder}
              className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all ${
                error ? 'border-red-300 ring-1 ring-red-300' : ''
              }`}
            />
          )}
          {field.helpText && <p className="mt-1 text-xs text-gray-400">💡 {field.helpText}</p>}
          {error && <p className="mt-1 text-sm text-red-500">⚠️ {error}</p>}
        </div>
      );
    },
    [formValues, fieldErrors, handleFieldChange]
  );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        <PageTransition>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="text-2xl hover:opacity-70">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {template.icon} {template.name}
            </h1>
            <p className="text-sm text-gray-500">{template.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ===== FORM ===== */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Fields */}
            {template.fields.map(renderField)}

            {/* ===== TOMBOL AI ===== */}
            <div className="flex flex-col gap-3 mt-4">
             <button
                type="button"
                onClick={handleAIHelp}
                disabled={isAIThinking || isAIGenerating}
                className="w-full py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isAIThinking ? '⏳ AI sedang berpikir...' : '🤖 Bantu AI isi field'}
              </button>

              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isAIThinking || isAIGenerating}
                className="w-full py-2.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isAIGenerating ? '⏳ AI sedang generate...' : '⚡ Isi & Generate Langsung dengan AI'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '⏳ Memproses...' : '🚀 Generate Prompt Manual'}
              </button>
            </div>
          </form>

          {/* ===== LIVE PREVIEW ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20 self-start">
            <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Preview
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[200px]">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                {livePrompt}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
    </>
  );
}