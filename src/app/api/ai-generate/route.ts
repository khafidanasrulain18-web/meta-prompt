// src/app/api/ai-generate/route.ts
// Proxy server-side ke DeepSeek API.
// PENTING: Panggilan ke DeepSeek HARUS terjadi di server, bukan di client,
// supaya API key (DEEPSEEK_API_KEY) tidak pernah terekspos ke browser.

import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// DeepSeek (dan LLM lain) kadang membungkus JSON dengan code fence
// ```json ... ``` meskipun sudah diminta "hanya JSON". Ini membuat
// JSON.parse() gagal. Fungsi ini membersihkan pembungkus tersebut
// sebelum parsing.
function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();

  // Fallback: ambil substring dari "{" pertama sampai "}" terakhir,
  // untuk berjaga-jaga jika ada teks tambahan di luar JSON.
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key DeepSeek tidak dikonfigurasi di server. Tambahkan DEEPSEEK_API_KEY di .env.local' },
        { status: 500 }
      );
    }

    const {
      templateId,
      templateName,
      category,
      fields,
      userDescription,
    }: {
      templateId: string;
      templateName: string;
      category: string;
      fields: Array<{ id: string; label: string; type: string; required?: boolean; options?: string[] }>;
      userDescription: string;
    } = await request.json();

    if (!templateName || !category || !Array.isArray(fields) || !userDescription?.trim()) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }

    const fieldDescriptions = fields
      .map((f) => {
        let line = `- id: "${f.id}" | label: "${f.label}" | tipe: ${f.type}${f.required ? ' (wajib diisi)' : ''}`;
        if (f.type === 'select' && f.options?.length) {
          line += `\n  Pilihan valid (HARUS pilih salah satu persis seperti ini, jangan buat pilihan baru): ${f.options
            .map((o) => `"${o}"`)
            .join(', ')}`;
        } else if (f.type === 'textarea') {
          line += `\n  Ini field teks panjang — isi dengan beberapa kalimat yang detail, spesifik, dan konkret (bukan satu frasa pendek).`;
        } else if (f.type === 'text') {
          line += `\n  Isi dengan jawaban yang spesifik dan deskriptif, bukan jawaban generik satu-dua kata.`;
        }
        return line;
      })
      .join('\n');

    const systemMessage = `Kamu adalah asisten AI yang membantu mengisi form pembuatan prompt untuk template "${templateName}" (kategori: ${category}).

Berikut daftar field yang harus diisi:
${fieldDescriptions}

ATURAN PENTING:
1. Untuk field bertipe "select", nilai HARUS persis sama dengan salah satu pilihan valid yang tercantum (termasuk emoji/kapitalisasi jika ada) — jangan mengarang pilihan baru.
2. Untuk field bertipe "text" dan "textarea", jangan berikan jawaban singkat atau generik. Gali detail dari deskripsi user: sebutkan angka/contoh konkret, nama, konteks, atau detail spesifik lain yang relevan. Field "textarea" wajib berisi minimal 2-4 kalimat yang detail dan actionable, bukan satu kalimat pendek.
3. Jangan mengulang deskripsi user kata-per-kata — kembangkan dan perkaya jadi lebih spesifik dan konkret, seolah kamu adalah expert di bidang ini yang memberi arahan detail.
4. Jangan tinggalkan field wajib kosong.
5. Balas HANYA dengan satu JSON object, tanpa teks lain, tanpa markdown code block, tanpa penjelasan.

Contoh format output (struktur saja, isi jangan ditiru mentah-mentah):
{ "topic": "Strategi konten Instagram untuk UMKM kuliner rumahan yang baru mulai jualan online, fokus ke reels resep singkat", "tone": "Santai", "length": "Panjang (1000+ kata)" }`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userDescription },
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent: string | undefined = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'Respons AI kosong.' }, { status: 502 });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(extractJson(rawContent));
    } catch (err) {
      console.error('Gagal parsing JSON dari AI:', err, rawContent);
      return NextResponse.json(
        { error: 'AI tidak memberikan format JSON yang valid. Coba deskripsi lain.' },
        { status: 502 }
      );
    }

    const result: Record<string, string | number> = {};
    for (const field of fields) {
      const value = parsed[field.id];
      if (value === undefined || value === null) continue;
      if (typeof value !== 'string' && typeof value !== 'number') continue;

      if (field.type === 'select' && field.options?.length) {
        // AI kadang sedikit meleset (beda kapitalisasi/spasi) dari pilihan
        // yang diminta — coba cocokkan longgar dulu sebelum menolak,
        // supaya field tidak kosong hanya karena selisih kecil.
        const strValue = String(value).trim();
        const exact = field.options.find((o) => o === strValue);
        const loose = field.options.find((o) => o.trim().toLowerCase() === strValue.toLowerCase());
        const match = exact || loose;
        if (match) {
          result[field.id] = match;
        }
        // Kalau tidak ada yang cocok sama sekali, field ini dilewati
        // (biar user isi manual) daripada menyimpan pilihan yang tidak valid.
        continue;
      }

      result[field.id] = value;
    }

    return NextResponse.json({ values: result });
  } catch (error) {
    console.error('AI generate route error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
