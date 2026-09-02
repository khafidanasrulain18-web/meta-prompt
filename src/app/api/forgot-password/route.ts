import { NextResponse } from 'next/server';
import { findUserByEmail, updateUserPassword } from '@/lib/models/user';
import { createResetToken, consumeResetToken } from '@/lib/models/resetToken';

// ============================================================
// POST /api/forgot-password
//
// Alur dua langkah untuk mencegah siapa pun mereset password akun
// orang lain hanya dengan mengetahui emailnya:
//
//   1) { step: 'request', email }
//      -> Membuat token reset sekali-pakai (MongoDB, TTL 15 menit).
//         Dalam produksi, token dikirim lewat email. Karena belum ada
//         layanan email, token dicatat di log server, dan (hanya di
//         development) ikut dikembalikan di response supaya alur tetap
//         bisa dites. Respons SELALU sukses baik email terdaftar atau
//         tidak, supaya endpoint ini tidak bisa dipakai menebak email
//         mana saja yang punya akun.
//
//   2) { step: 'reset', email, token, newPassword }
//      -> Memverifikasi token sebelum benar-benar mengganti password.
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const step = body.step === 'reset' ? 'reset' : 'request';

    if (step === 'request') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
      }

      const user = await findUserByEmail(email);
      if (user) {
        const token = await createResetToken(email);
        // TODO produksi: kirim `token` lewat email, jangan pernah
        // mengembalikannya langsung di response.
        console.log(`[forgot-password] Token reset untuk ${user.email}: ${token}`);

        return NextResponse.json({
          success: true,
          message: 'Jika email terdaftar, kode reset telah dikirim.',
          ...(process.env.NODE_ENV !== 'production' ? { devToken: token } : {}),
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, kode reset telah dikirim.',
      });
    }

    // step === 'reset'
    const { email, token, newPassword } = body;
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Email, kode reset, dan password baru wajib diisi' },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const valid = await consumeResetToken(email, token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Kode reset tidak valid atau sudah kedaluwarsa. Minta kode baru.' },
        { status: 400 }
      );
    }

    const updated = await updateUserPassword(email, newPassword);
    if (!updated) {
      return NextResponse.json({ error: 'Email tidak terdaftar' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
