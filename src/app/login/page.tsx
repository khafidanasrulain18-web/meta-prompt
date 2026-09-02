'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

// Komponen inner yang menggunakan useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'Configuration':
          setError('Terjadi kesalahan konfigurasi. Silakan coba lagi.');
          break;
        case 'CredentialsSignin':
          setError('Email atau password salah.');
          break;
        case 'SessionRequired':
          setError('Sesi habis. Silakan login kembali.');
          break;
        default:
          setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah.');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-2xl animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Landing */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block"
          >
            <div className="space-y-6">
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-4xl font-bold text-gray-900">
                Selamat Datang di <br />
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  Prompt Studio
                </span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed">
                Platform cerdas untuk membuat prompt berkualitas dengan bantuan AI.
              </p>
              <div className="flex flex-col gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="text-blue-500 text-xl">✨</span>
                  <span>Generate prompt dengan AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-500 text-xl">📚</span>
                  <span>6+ template siap pakai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-500 text-xl">💾</span>
                  <span>Simpan riwayat prompt</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
              <p className="text-gray-500 text-sm mt-1">Masukkan email dan password</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-blue-500 hover:text-blue-600 hover:underline">
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? '⏳ Memproses...' : '🚀 Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-600 hover:underline font-medium">
                Daftar sekarang
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

// Export dengan Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20">⏳ Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}