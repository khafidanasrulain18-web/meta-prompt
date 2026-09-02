import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Template } from '@/types/template';

const TemplateCard = memo(({ template, index }: { template: Template; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
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
        {template.tags && template.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

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
  );
});

TemplateCard.displayName = 'TemplateCard';
export default TemplateCard;
