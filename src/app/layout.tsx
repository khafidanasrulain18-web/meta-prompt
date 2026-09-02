import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import SessionProvider from '@/components/SessionProvider';
import LoadingIndicator from '@/components/LoadingIndicator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prompt Studio — Build Better Prompts',
  description: 'Template-based prompt builder with AI assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50/50 text-gray-900 antialiased font-sans">
        <SessionProvider>
          <Suspense fallback={null}>
            <LoadingIndicator />
          </Suspense>

          <Navbar />

          <AnimatePresence mode="wait">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              {children}
            </main>
          </AnimatePresence>

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
