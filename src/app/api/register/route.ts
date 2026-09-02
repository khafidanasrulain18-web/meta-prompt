import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/models/user';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    try {
      const user = await createUser({ name, email, password });
      return NextResponse.json({ success: true, user });
    } catch (err: unknown) {
      // Index unik di email menangkap race condition: dua request register
      // bersamaan dengan email yang sama.
      if (typeof err === 'object' && err && 'code' in err && (err as { code?: number }).code === 11000) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
