import { Template } from '@/types/template';

// ============================================================
// DATA TEMPLATE — 6 KATEGORI DENGAN FIELD SPESIFIK
// ============================================================

export const TEMPLATES: Template[] = [
  // ==========================================================
  // 1. WRITING — Artikel Blog
  // ==========================================================
  {
    id: 'writing-article',
    category: 'Writing',
    name: 'Artikel Blog',
    icon: '✍️',
    color: '#FF6B6B',
    description: 'Buat artikel blog yang engaging dengan gaya tulisan yang kamu inginkan. Cocok untuk konten mendalam!',
    tags: ['blog', 'konten', 'artikel', 'menulis'],
    fields: [
      {
        id: 'topic',
        label: '🎯 Topik Artikel',
        type: 'text',
        placeholder: 'Contoh: Tips produktivitas untuk pekerja kreatif...',
        required: true,
        helpText: 'Semakin spesifik topik, semakin tajam hasilnya!',
      },
      {
        id: 'tone',
        label: '🎭 Gaya Bahasa',
        type: 'select',
        options: ['Santai & Personal', 'Formal & Profesional', 'Persuasif & Menggugah', 'Inspiratif & Semangat'],
        required: true,
        defaultValue: 'Santai & Personal',
        helpText: 'Pilih nada yang paling cocok dengan audiens-mu.',
      },
      {
        id: 'length',
        label: '📏 Panjang Artikel',
        type: 'select',
        options: ['Pendek (300-400 kata)', 'Sedang (600-800 kata)', 'Panjang (1000-1500 kata)', 'Epic (2000+ kata)'],
        defaultValue: 'Sedang (600-800 kata)',
        helpText: 'Sesuaikan dengan platform dan tujuan konten.',
      },
      {
        id: 'structure',
        label: '📋 Struktur Tambahan',
        type: 'select',
        options: ['Standar (Pendahuluan-Isi-Kesimpulan)', 'Problem-Solution', 'Listicle/Bullet Points', 'Storytelling'],
        defaultValue: 'Standar (Pendahuluan-Isi-Kesimpulan)',
        helpText: 'Pilih struktur yang paling sesuai dengan topikmu.',
      },
      {
        id: 'target_audience',
        label: '👥 Target Audiens',
        type: 'text',
        placeholder: 'Contoh: Millennial yang sibuk, profesional IT, ibu rumah tangga...',
        helpText: 'Siapa yang akan membaca artikel ini?',
      },
    ],
    promptTemplate: (values) => {
      const topic = values.topic || 'topik pilihanmu';
      const tone = values.tone || 'Santai & Personal';
      const length = values.length || 'Sedang (600-800 kata)';
      const structure = values.structure || 'Standar (Pendahuluan-Isi-Kesimpulan)';
      const audience = values.target_audience || 'pembaca umum';

      return `Tulis sebuah artikel blog yang engaging dengan topik "${topic}".

GAYA BAHASA: ${tone}
PANJANG: ${length}
STRUKTUR: ${structure}
TARGET AUDIENS: ${audience}

Instruksi tambahan:
- Buat pendahuluan yang menarik perhatian pembaca
- Kembangkan isi dengan poin-poin yang jelas dan berbobot
- Akhiri dengan kesimpulan yang inspiratif atau call-to-action
- Gunakan bahasa yang mengalir natural dan tidak kaku
- Tambahkan pertanyaan retoris atau interaksi dengan pembaca

Mulai tulis artikelnya:`;
    },
    examplePrompt: 'Tulis artikel blog tentang "Tips produktivitas untuk pekerja kreatif" dengan gaya santai dan personal...',
  },

  // ==========================================================
  // 2. CODING — Code Generator & Debugging
  // ==========================================================
  {
    id: 'coding-generator',
    category: 'Coding',
    name: 'Code Generator',
    icon: '💻',
    color: '#4ECDC4',
    description: 'Generate kode atau bantu debug dengan cepat. Support berbagai bahasa dan framework!',
    tags: ['programming', 'debug', 'javascript', 'python', 'react'],
    fields: [
      {
        id: 'language',
        label: '⚡ Bahasa Pemrograman',
        type: 'select',
        options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'],
        required: true,
        defaultValue: 'JavaScript',
        helpText: 'Pilih bahasa yang paling kamu kuasai atau butuh bantuan.',
      },
      {
        id: 'task_type',
        label: '🔧 Jenis Tugas',
        type: 'select',
        options: ['Generate fungsi/utility', 'Debug & perbaiki error', 'Optimasi performa', 'Refactor kode', 'Buat unit test', 'Dokumentasi kode'],
        required: true,
        defaultValue: 'Generate fungsi/utility',
        helpText: 'Apa yang ingin kamu selesaikan hari ini?',
      },
      {
        id: 'description',
        label: '📝 Deskripsi Tugas',
        type: 'textarea',
        placeholder: 'Contoh: Buat fungsi untuk menghitung faktorial dengan rekursif...\nAtau: Kode saya error "Cannot read property of undefined"...',
        required: true,
        helpText: 'Jelaskan sedetail mungkin — semakin jelas, semakin akurat hasilnya!',
      },
      {
        id: 'framework',
        label: '📦 Framework / Library (opsional)',
        type: 'text',
        placeholder: 'Contoh: React, Express, Django, Spring Boot...',
        helpText: 'Jika ada framework spesifik, tulis di sini.',
      },
      {
        id: 'complexity',
        label: '📊 Level Kompleksitas',
        type: 'select',
        options: ['Sederhana (pemula)', 'Menengah (intermediate)', 'Kompleks (expert)'],
        defaultValue: 'Menengah (intermediate)',
        helpText: 'Pilih tingkat kesulitan yang kamu inginkan.',
      },
    ],
    promptTemplate: (values) => {
      const lang = values.language || 'JavaScript';
      const task = values.task_type || 'Generate fungsi/utility';
      const desc = values.description || 'tugas pemrograman';
      const framework = values.framework ? `\nFRAMEWORK: ${values.framework}` : '';
      const complexity = values.complexity || 'Menengah (intermediate)';

      return `Bantu saya dengan tugas pemrograman berikut:

BAHASA: ${lang}
JENIS TUGAS: ${task}
KOMPLEKSITAS: ${complexity}${framework}

DESKRIPSI TUGAS:
${desc}

Instruksi tambahan:
- Berikan kode yang bersih dan well-commented
- Sertakan penjelasan cara kerja kode
- Jika ada error, jelaskan penyebab dan solusinya
- Tambahkan contoh penggunaan jika relevan
- Gunakan best practices untuk bahasa ${lang}

Mulai bantu saya:`;
    },
    examplePrompt: 'Buat fungsi JavaScript untuk mengurutkan array of objects berdasarkan properti tertentu...',
  },

  // ==========================================================
  // 3. IMAGE AI — Midjourney / DALL-E Prompt
  // ==========================================================
  {
    id: 'image-ai',
    category: 'Image AI',
    name: 'Prompt Image AI',
    icon: '🎨',
    color: '#A78BFA',
    description: 'Buat prompt visual yang memukau untuk Midjourney, DALL-E, atau Stable Diffusion!',
    tags: ['midjourney', 'dall-e', 'stable-diffusion', 'ai-art', 'visual'],
    fields: [
      {
        id: 'subject',
        label: '🖼️ Subjek Utama',
        type: 'text',
        placeholder: 'Contoh: Kucing siam bermata biru, robot futuristik, pemandangan pantai...',
        required: true,
        helpText: 'Apa yang menjadi fokus utama gambar?',
      },
      {
        id: 'style',
        label: '🎭 Gaya Artistik',
        type: 'select',
        options: ['Realistis', 'Kartun/Ilustrasi', 'Impressionis', 'Cyberpunk', 'Fantasi', 'Minimalis', 'Vintage/Retro', '3D Render', 'Watercolor', 'Oil Painting'],
        required: true,
        defaultValue: 'Realistis',
        helpText: 'Pilih gaya yang paling sesuai dengan mood visual yang diinginkan.',
      },
      {
        id: 'lighting',
        label: '💡 Pencahayaan',
        type: 'select',
        options: ['Natural Light (Golden Hour)', 'Studio Lighting', 'Dramatic / Low Key', 'Soft / Diffused', 'Neon / Cyber', 'Cinematic', 'Backlight / Silhouette'],
        defaultValue: 'Natural Light (Golden Hour)',
        helpText: 'Lighting sangat mempengaruhi mood gambar!',
      },
      {
        id: 'composition',
        label: '📐 Komposisi',
        type: 'select',
        options: ['Close-up / Detail', 'Medium Shot', 'Wide Shot / Landscape', 'Bird\'s Eye View', 'Low Angle / Hero Shot', 'Symmetrical', 'Rule of Thirds'],
        defaultValue: 'Medium Shot',
        helpText: 'Bagaimana subjek diposisikan dalam frame?',
      },
      {
        id: 'mood',
        label: '🌅 Mood & Atmosfer',
        type: 'text',
        placeholder: 'Contoh: Tenang dan damai, epik dan dramatis, misterius...',
        helpText: 'Tambahkan kata-kata untuk membangun atmosfer.',
      },
      {
        id: 'extra_details',
        label: '✨ Detail Tambahan',
        type: 'textarea',
        placeholder: 'Contoh: Dengan latar kota futuristik, rambut tertiup angin, warna pastel...',
        helpText: 'Semakin detail, semakin kaya hasil gambarnya!',
      },
    ],
    promptTemplate: (values) => {
      const subject = values.subject || 'subjek visual';
      const style = values.style || 'Realistis';
      const lighting = values.lighting || 'Natural Light (Golden Hour)';
      const composition = values.composition || 'Medium Shot';
      const mood = values.mood || 'atmosfer yang indah';
      const extra = values.extra_details || '';

      return `Buat prompt gambar AI untuk menghasilkan visual dengan spesifikasi berikut:

SUBJEK UTAMA: ${subject}
GAYA ARTISTIK: ${style}
PENCAHAYAAN: ${lighting}
KOMPOSISI: ${composition}
MOOD: ${mood}
${extra ? `DETAIL TAMBAHAN: ${extra}` : ''}

Format prompt (untuk Midjourney/DALL-E/Stable Diffusion):

"/imagine prompt: ${subject}, ${style} style, ${lighting}, ${composition}, ${mood}${extra ? ', ' + extra : ''} --ar 16:9 --v 6"

Atau untuk DALL-E:
"Create a ${style} image of ${subject} with ${lighting}, ${composition}, ${mood}${extra ? ', ' + extra : ''}"`;
    },
    examplePrompt: 'Kucing siam bermata biru, realistis, golden hour lighting, close-up detail, mood yang tenang...',
  },

  // ==========================================================
  // 4. BUSINESS — Business Plan & Strategy
  // ==========================================================
  {
    id: 'business-plan',
    category: 'Business',
    name: 'Business Plan',
    icon: '📊',
    color: '#FFB74D',
    description: 'Kembangkan ide bisnis jadi rencana aksi yang solid. Cocok untuk startup dan bisnis kecil!',
    tags: ['startup', 'bisnis', 'strategi', 'marketing', 'keuangan'],
    fields: [
      {
        id: 'business_idea',
        label: '💡 Ide Bisnis',
        type: 'text',
        placeholder: 'Contoh: Kafe dengan konsep ruang baca dan co-working...',
        required: true,
        helpText: 'Apa bisnis yang ingin kamu bangun?',
      },
      {
        id: 'target_market',
        label: '🎯 Target Pasar',
        type: 'text',
        placeholder: 'Contoh: Millennial urban berusia 25-35 tahun yang suka working from cafe...',
        required: true,
        helpText: 'Siapa pelanggan idealmu?',
      },
      {
        id: 'business_phase',
        label: '📌 Fase Bisnis',
        type: 'select',
        options: ['Ideasi / Validasi', 'Perencanaan Awal', 'Peluncuran (Launch)', 'Growth & Skala', 'Maturasi & Ekspansi'],
        required: true,
        defaultValue: 'Ideasi / Validasi',
        helpText: 'Di tahap mana bisnismu saat ini?',
      },
      {
        id: 'strategy_focus',
        label: '🎯 Fokus Strategi',
        type: 'select',
        options: ['Value Proposition', 'Business Model Canvas', 'Go-to-Market Strategy', 'Digital Marketing Plan', 'Financial Projection', 'Team & Operations'],
        defaultValue: 'Value Proposition',
        helpText: 'Apa aspek utama yang ingin dikembangkan?',
      },
      {
        id: 'challenges',
        label: '🚧 Tantangan Saat Ini',
        type: 'textarea',
        placeholder: 'Contoh: Sulit mendapatkan customer pertama, kurang modal, belum punya tim...',
        helpText: 'Ceritakan tantangan yang dihadapi agar strategi lebih tepat sasaran.',
      },
    ],
    promptTemplate: (values) => {
      const idea = values.business_idea || 'ide bisnis';
      const market = values.target_market || 'target pasar';
      const phase = values.business_phase || 'Ideasi / Validasi';
      const focus = values.strategy_focus || 'Value Proposition';
      const challenges = values.challenges || '';

      return `Kembangkan rencana bisnis untuk ide berikut:

IDE BISNIS: ${idea}
TARGET PASAR: ${market}
FASE BISNIS: ${phase}
FOKUS STRATEGI: ${focus}
${challenges ? `TANTANGAN: ${challenges}` : ''}

Instruksi:
1. Jelaskan value proposition yang kuat dan unik
2. Analisis kompetitor dan positioning
3. Rancang model bisnis (aliran pendapatan, struktur biaya)
4. Strategi marketing & customer acquisition
5. Rencana operasional dan milestone 3-6 bulan ke depan
6. Proyeksi keuangan sederhana

Buat rekomendasi yang actionable dan realistis untuk fase ${phase}.`;
    },
    examplePrompt: 'Kafe dengan konsep ruang baca dan co-working, target millennial urban, fokus value proposition...',
  },

  // ==========================================================
  // 5. EDUCATION — Tutor & Belajar
  // ==========================================================
  {
    id: 'education-tutor',
    category: 'Education',
    name: 'Tutor Belajar',
    icon: '📚',
    color: '#66BB6A',
    description: 'Dapatkan penjelasan konsep, latihan soal, atau panduan belajar yang mudah dipahami!',
    tags: ['belajar', 'tutor', 'edukasi', 'konsep', 'latihan'],
    fields: [
      {
        id: 'topic',
        label: '📖 Topik / Materi',
        type: 'text',
        placeholder: 'Contoh: Persamaan kuadrat, Revolusi Industri 4.0, Pemrograman OOP...',
        required: true,
        helpText: 'Materi apa yang ingin kamu pelajari?',
      },
      {
        id: 'level',
        label: '📊 Level Pemahaman',
        type: 'select',
        options: ['Pemula (belum tahu sama sekali)', 'Menengah (sudah pernah dengar)', 'Lanjutan (mau deepen knowledge)'],
        required: true,
        defaultValue: 'Pemula (belum tahu sama sekali)',
        helpText: 'Pilih level untuk penjelasan yang sesuai.',
      },
      {
        id: 'learning_style',
        label: '🧠 Gaya Belajar',
        type: 'select',
        options: ['Penjelasan konsep (teori)', 'Contoh kasus / aplikasi', 'Latihan soal & pembahasan', 'Mind map & ringkasan', 'Storytelling / analogi'],
        required: true,
        defaultValue: 'Penjelasan konsep (teori)',
        helpText: 'Bagaimana kamu paling mudah memahami?',
      },
      {
        id: 'difficulty',
        label: '🎯 Tingkat Kesulitan',
        type: 'select',
        options: ['Mudah (basic)', 'Sedang (intermediate)', 'Sulit (advanced)'],
        defaultValue: 'Sedang (intermediate)',
        helpText: 'Pilih tingkat tantangan yang kamu inginkan.',
      },
      {
        id: 'specific_question',
        label: '❓ Pertanyaan Spesifik (opsional)',
        type: 'textarea',
        placeholder: 'Contoh: Kenapa nilai diskriminan menentukan jenis akar persamaan kuadrat?',
        helpText: 'Tulis pertanyaan spesifik agar fokus jawaban lebih tajam.',
      },
    ],
    promptTemplate: (values) => {
      const topic = values.topic || 'topik pembelajaran';
      const level = values.level || 'Pemula (belum tahu sama sekali)';
      const style = values.learning_style || 'Penjelasan konsep (teori)';
      const difficulty = values.difficulty || 'Sedang (intermediate)';
      const question = values.specific_question || '';

      return `Jadilah tutor yang sabar dan menjelaskan dengan cara yang mudah dipahami.

TOPIK: ${topic}
LEVEL PEMAHAMAN: ${level}
GAYA BELAJAR: ${style}
TINGKAT KESULITAN: ${difficulty}
${question ? `PERTANYAAN SPESIFIK: ${question}` : ''}

Instruksi:
- Jelaskan konsep dengan bahasa yang sederhana dan tidak kaku
- Gunakan analogi atau contoh sehari-hari untuk memudahkan pemahaman
- Berikan contoh aplikasi nyata (jika relevan)
- Strukturkan penjelasan secara logis dan bertahap
- Akhiri dengan rangkuman singkat dan poin-poin kunci
${style === 'Latihan soal & pembahasan' ? '- Berikan 3-5 latihan soal dengan pembahasan step-by-step' : ''}

Mulai jelaskan:`;
    },
    examplePrompt: 'Persamaan kuadrat, level pemula, gaya belajar penjelasan konsep + contoh kasus...',
  },

  // ==========================================================
  // 6. SOCIAL MEDIA — Caption & Content Generator
  // ==========================================================
  {
    id: 'social-media',
    category: 'Social Media',
    name: 'Caption Generator',
    icon: '📱',
    color: '#EC407A',
    description: 'Buat caption, hook, dan konten sosial media yang viral-worthy. Support berbagai platform!',
    tags: ['instagram', 'tiktok', 'twitter', 'caption', 'viral'],
    fields: [
      {
        id: 'platform',
        label: '📱 Platform',
        type: 'select',
        options: ['Instagram (Feed)', 'Instagram (Story)', 'TikTok', 'Twitter / X', 'LinkedIn', 'Facebook', 'YouTube (Deskripsi)'],
        required: true,
        defaultValue: 'Instagram (Feed)',
        helpText: 'Pilih platform untuk menyesuaikan tone dan format.',
      },
      {
        id: 'topic',
        label: '📝 Topik / Tema',
        type: 'text',
        placeholder: 'Contoh: Produktivitas pagi hari, review produk skincare, tips traveling...',
        required: true,
        helpText: 'Apa yang ingin kamu bagikan?',
      },
      {
        id: 'mood',
        label: '🎭 Mood & Tone',
        type: 'select',
        options: ['Inspiratif & Semangat', 'Lucu & Santai', 'Profesional & Kredibel', 'Emosional & Menyentuh', 'Edukatif & Informatif', 'Edgy & Kekinian'],
        required: true,
        defaultValue: 'Inspiratif & Semangat',
        helpText: 'Pilih mood yang ingin ditonjolkan.',
      },
      {
        id: 'hashtags',
        label: '#️⃣ Jumlah Hashtag',
        type: 'select',
        options: ['Tanpa hashtag', 'Sedikit (3-5)', 'Sedang (10-15)', 'Banyak (20-30)'],
        defaultValue: 'Sedang (10-15)',
        helpText: 'Sesuaikan dengan kebijakan platform.',
      },
      {
        id: 'call_to_action',
        label: '📢 Call to Action',
        type: 'select',
        options: ['Tanpa CTA', 'Minta like & follow', 'Minta komen pendapat', 'Minta share / tag teman', 'Link di bio / swipe up'],
        defaultValue: 'Minta like & follow',
        helpText: 'Aksi apa yang ingin dilakukan audiens?',
      },
      {
        id: 'extra_context',
        label: '📌 Konteks Tambahan',
        type: 'textarea',
        placeholder: 'Contoh: Ini adalah foto di pantai saat sunset, produk yang direview adalah serum vitamin C...',
        helpText: 'Tambahkan detail visual atau konteks untuk hasil yang lebih personal.',
      },
    ],
    promptTemplate: (values) => {
      const platform = values.platform || 'Instagram (Feed)';
      const topic = values.topic || 'topik konten';
      const mood = values.mood || 'Inspiratif & Semangat';
      const hashtags = values.hashtags || 'Sedang (10-15)';
      const cta = values.call_to_action || 'Minta like & follow';
      const context = values.extra_context || '';

      return `Buat konten sosial media yang engaging untuk platform ${platform}.

TOPIK: ${topic}
MOOD: ${mood}
CALL TO ACTION: ${cta}
HASHTAG: ${hashtags}
${context ? `KONTEKS TAMBAHAN: ${context}` : ''}

Instruksi untuk caption:
- Buat ${platform === 'Instagram (Feed)' ? 'caption yang menarik dan easy to read' : 
     platform === 'TikTok' ? 'hook yang strong di 3 detik pertama' :
     platform === 'Twitter / X' ? 'tweet yang impactful dan to the point (max 280 karakter)' :
     platform === 'LinkedIn' ? 'postingan profesional dengan value yang jelas' :
     'deskripsi yang informatif dan engaging'}
- Gunakan emoji secukupnya untuk menambah ekspresi
- Buat pembuka yang langsung menarik perhatian
- Sertakan value atau insight yang bermanfaat
- Akhiri dengan ${cta === 'Tanpa CTA' ? 'kesimpulan yang strong' : `call to action yang natural: ${cta}`}
${hashtags !== 'Tanpa hashtag' ? `- Berikan rekomendasi hashtag (${hashtags}) yang relevan dan trending` : ''}

Mulai tulis captionnya:`;
    },
    examplePrompt: 'Instagram Feed, produktivitas pagi hari, mood inspiratif & semangat, dengan CTA minta like & follow...',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getCategories(): string[] {
  const unique = new Set(TEMPLATES.map((t) => t.category));
  return Array.from(unique);
}

export function getCategoryIcon(category: string): string {
  const template = TEMPLATES.find((t) => t.category === category);
  return template?.icon || '📦';
}

export function getCategoryColor(category: string): string {
  const template = TEMPLATES.find((t) => t.category === category);
  return template?.color || '#888';
}