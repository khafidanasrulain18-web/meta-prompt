// src/lib/deepseek.ts
//
// Fungsi ini berjalan di CLIENT dan memanggil API route internal kita
// (/api/ai-generate), yang kemudian memanggil DeepSeek di SERVER.
// Ini penting agar DEEPSEEK_API_KEY tidak pernah terekspos ke browser.

export interface TemplateFieldForAI {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

// ============================================================
// FUNGSI AI GENERATIF: generatePromptFromDescription
// ============================================================
export async function generatePromptFromDescription(
  templateId: string,
  templateName: string,
  category: string,
  fields: TemplateFieldForAI[],
  userDescription: string
): Promise<Record<string, string | number>> {
  const response = await fetch('/api/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId,
      templateName,
      category,
      fields,
      userDescription,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    throw new Error(data?.error || `Gagal memanggil AI (status ${response.status})`);
  }

  return data.values as Record<string, string | number>;
}
