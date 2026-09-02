'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TEMPLATES, getCategories } from '@/data/templates';
import PageTransition from '@/components/PageTransition';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => getCategories(), []);
  const filteredTemplates = useMemo(() => {
    let result = TEMPLATES;
    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="text-center py-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Prompt Studio
        </h1>
        <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
          Buat Prompt <span className="text-blue-500">Lebih Cerdas</span>
        </p>
        <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
          Pilih template, isi detail, dan biarkan AI membantu menyusun prompt sempurna.
        </p>
      </section>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Template */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔎</div>
          <h3 className="text-xl font-medium text-gray-700">Tidak ditemukan</h3>
          <p className="text-gray-400">Coba kata kunci lain atau reset filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="mt-4 px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/80 p-6 h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-blue-200/60 transition-all duration-200 flex flex-col">
                {/* Icon & Nama */}
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-400">{template.category}</p>
                  </div>
                </div>

                {/* Deskripsi */}
                <p className="mt-3 text-sm text-gray-500 flex-1">{template.description}</p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {template.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Tombol */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/ai-generate/${template.id}`}
                    className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-opacity"
                  >
                    ✨ AI Generate
                  </Link>
                  <Link
                    href={`/builder/${template.id}`}
                    className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Manual
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}