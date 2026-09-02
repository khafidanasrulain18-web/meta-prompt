import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { listPromptsForUser, createPromptForUser } from '@/lib/models/prompt';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  }

  try {
    const items = await listPromptsForUser(session.user.id);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { templateId, templateName, category, icon, color, values, result } = body;

    if (!templateId || !templateName || !category || !result || typeof values !== 'object') {
      return NextResponse.json({ error: 'Data prompt tidak lengkap' }, { status: 400 });
    }

    const saved = await createPromptForUser(session.user.id, {
      templateId,
      templateName,
      category,
      icon,
      color,
      values,
      result,
    });

    return NextResponse.json({ item: saved });
  } catch (error) {
    console.error('History POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
