'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className="text-8xl mb-6">🤔</div>
        <h1 className="text-4xl font-display font-bold text-gray-900">Waduh, halaman nggak ketemu!</h1>
        <p className="text-gray-500 mt-2 max-w-md">
          Mungkin URL-nya salah, atau halaman ini sudah pindah.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block btn-apple-primary"
        >
          🏠 Kembali ke Home
        </Link>
      </motion.div>
    </div>
  );
}