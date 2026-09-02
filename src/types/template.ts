// ============================================================
// TYPE DEFINITIONS — Struktur Data Template yang Scalable
// ============================================================

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'color';

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // untuk type 'select'
  required?: boolean;
  defaultValue?: string | number;
  helpText?: string; // petunjuk kecil yang playful
}

export interface Template {
  id: string;
  category: string;
  name: string;
  icon: string;
  color: string; // hex color untuk theming card
  description: string; // deskripsi singkat yang playful
  fields: TemplateField[];
  promptTemplate: (values: Record<string, string | number>) => string;
  examplePrompt?: string; // contoh prompt untuk inspirasi
  tags?: string[]; // untuk search/filter
}

export interface SavedPrompt {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  icon: string;
  color: string;
  values: Record<string, string | number>;
  result: string;
  createdAt: string;
  isFavorite?: boolean;
  notes?: string;
}