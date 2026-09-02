// src/types/next-auth.d.ts
//
// Menambahkan `id` ke tipe `session.user` bawaan NextAuth, supaya
// `session.user.id` valid secara TypeScript di mana pun sesi dipakai
// (route API /api/history, komponen client seperti Navbar, dll).

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
