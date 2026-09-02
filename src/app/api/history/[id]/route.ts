import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { deletePromptForUser, setPromptFavorite } from '@/lib/models/prompt';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  }

  try {
    const deleted = await deletePromptForUser(session.user.id, params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Prompt tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History DELETE error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (typeof body.isFavorite !== 'boolean') {
      return NextResponse.json({ error: 'isFavorite (boolean) wajib diisi' }, { status: 400 });
    }

    const updated = await setPromptFavorite(session.user.id, params.id, body.isFavorite);
    if (!updated) {
      return NextResponse.json({ error: 'Prompt tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error('History PATCH error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
