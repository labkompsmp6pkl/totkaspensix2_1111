/**
 * @file teacherAiService.ts
 * @description AI services specifically for teacher features (Class Analysis, Strategic Advice).
 */

import { queryWithPipeline } from "./pipeline";

/**
 * CLASS ANALYSIS INSTRUCTIONS - TEACHER ORIENTED
 */
const CLASS_ANALYSIS_INSTRUCTIONS: Record<string, string> = {
  utama: `TUGAS AI UTAMA - TULIS DRAFT ANALISIS KELAS:
Buatlah analisis mendalam untuk guru kelas yang mencakup:
1. PEMBUKAAN (PROFIL KELAS): Gambaran umum performa kelas, apresiasi terhadap usaha guru dan siswa, serta identifikasi area yang perlu perhatian khusus.
2. ANALISIS DETAIL MAPEL PALING SULIT: Mengapa mapel ini menjadi yang paling sulit (analisis berdasarkan tipe soal, materi, atau pola kesalahan), topik-topik spesifik yang paling banyak menyebabkan kesalahan, contoh soal atau tipe soal yang sering dijawab salah, dan analisis kesalahan umum (kurang pemahaman konsep, kurang teliti, atau soal pengecoh).
3. KRITIK MEMBANGUN TERHADAP PROSES PEMBELAJARAN: Identifikasi kemungkinan penyebab dari sisi pengajaran (metode, contoh soal, latihan, waktu) dengan bahasa SANTUN dan MEMBANGUN. Fokus pada SOLUSI. JANGAN menyalahkan guru, tapi berikan sudut pandang alternatif untuk peningkatan.
4. REKOMENDASI STRATEGI PEMBELAJARAN (PRIORITAS UTAMA): Strategi jangka pendek (minggu depan), menengah (1 bulan), dan panjang (1 semester). Sertakan metode aktif seperti Peer Teaching atau Flipped Classroom jika relevan.
5. SARAN UNTUK GURU (PRAKTIS DAN LANGSUNG BISA DILAKUKAN): Tips mengajar spesifik untuk mapel tersulit, tips evaluasi pembelajaran, dan cara menangani siswa yang tertinggal.
6. SARAN UNTUK SISWA (BISA DISAMPAIKAN GURU): Cara belajar efektif, sumber belajar tambahan, tips mengerjakan soal tipe tertentu, dan cara mengelola waktu saat ujian.
7. PENUTUP DAN MOTIVASI: Harapan perbaikan di masa depan dan semangat untuk guru dan siswa.

ATURAN KHUSUS:
- Gunakan bahasa Indonesia yang jelas, santun, dan profesional.
- Panjang tulisan 500-600 kata.
- FORMAT: TEKS POLOS MURNI.
- DILARANG KERAS menggunakan simbol markdown (#, *, _, -, >, •).
- JANGAN gunakan format poin-poin atau numbering.
- TULIS DALAM BENTUK PARAGRAF YANG MENGALIR.
- Sampaikan KRITIK dengan SANTUN dan MEMBANGUN, jangan menyalahkan.
- Setiap REKOMENDASI harus PRAKTIS dan BISA DILAKUKAN.`,

  korektor: `TUGAS AI KOREKTOR - PERBAIKI DRAFT INI:
Perbaiki draft analisis kelas dengan TELITI:
1. KETEPATAN ANALISIS: Apakah analisis mengapa mapel tersulit menjadi tersulit sudah masuk akal? Apakah identifikasi topik spesifik dan contoh soal sudah tepat dan relevan?
2. KESEIMBANGAN KRITIK DAN SARAN: Apakah kritik disampaikan dengan santun dan tidak menyalahkan? Apakah setiap kritik diimbangi dengan solusi praktis? Pastikan nada bicara tetap profesional.
3. KELENGKAPAN REKOMENDASI: Pastikan ada rekomendasi jangka pendek, menengah, panjang, serta saran spesifik untuk guru dan siswa.
4. KETERUKURAN SARAN: Apakah saran yang diberikan bisa diukur keberhasilannya? Pastikan saran spesifik (misal: sebutkan durasi atau frekuensi).
5. KEJELASAN BAHASA: Apakah bahasa mudah dipahami guru? Hapus istilah teknis AI yang tidak perlu.

ATURAN KHUSUS:
- Perbaiki tanpa mengubah maksud utama.
- Tambahkan detail praktis yang kurang.
- Perhalus bahasa kritik agar lebih membangun.
- FORMAT: TEKS POLOS MURNI.
- DILARANG KERAS menggunakan simbol markdown APAPUN.`,

  penyempurna: `TUGAS AI PENYEMPURNA - BUAT TEKS INI MENJADI FINAL:
Sempurnakan teks agar menjadi HASIL AKHIR yang siap digunakan oleh guru.
1. ALUR DAN STRUKTUR: Pastikan alur laporan logis, mudah diikuti, dengan transisi antar bagian yang halus dan alami.
2. NADA BICARA: Gunakan nada profesional namun bersahabat, santun, and menghargai usaha guru. Kritik disampaikan sebagai "saran perbaikan" atau "peluang peningkatan".
3. KEKUATAN ARGUMEN: Perkuat setiap rekomendasi dengan alasan yang jelas dan dasar pemikiran pedagogis yang sederhana.
4. KEMUDAHAN IMPLEMENTASI: Pastikan setiap saran bisa langsung dilakukan tanpa persiapan rumit. Gunakan bahasa operasional (kata kerja yang jelas).
5. PERTAHANKAN PANJANG TEKS: Jangan meringkas teks. Pastikan semua detail dari tahap sebelumnya tetap ada, hanya diperhalus bahasanya.

PERINTAH TEGAS:
- HAPUS SEMUA simbol markdown (#, *, _, -, >, •) jika masih ada.
- Pastikan teks 100% BERSIH and siap dibaca guru.
- HASIL AKHIR HARUS BERUPA TEKS POLOS MURNI, TANPA SATU PUN SIMBOL ANEH.
- TIDAK BOLEH ADA FORMAT POIN-POIN ATAU NUMBERING.`
};

/**
 * Generates a detailed analysis for an entire class.
 */
export const getDetailedClassAnalysis = async (className: string, stats: any): Promise<string> => {
  const prompt = `Laporan Analisis Kelas ${className} SMPN 06 Pekalongan:
Data: Rata-rata ${stats.classAverageScore}, Mapel Tersulit ${stats.mostMissedSubject}, Siswa ${stats.totalStudents}.
Data Tambahan: Distribusi ${JSON.stringify(stats.scoreDistribution)}, Topik ${JSON.stringify(stats.difficultTopics)}, Pola ${JSON.stringify(stats.commonErrorPatterns)}.`;

  return await queryWithPipeline(prompt, 0.8, CLASS_ANALYSIS_INSTRUCTIONS);
};

/**
 * Explains why a specific answer was wrong.
 */
export const explainWrongAnswer = async (question: any, userAnswer: string): Promise<string> => {
  const correctText = question.options?.find((o: any) => o.id === question.correctOptionId)?.text || 'Kunci Jawaban';
  const userText = question.options?.find((o: any) => o.id === userAnswer)?.text || 'Jawaban Terpilih';
  
  const prompt = `Jelaskan mengapa jawaban benar itu yang paling tepat. Buat penjelasan yang membuat siswa paham kesalahannya.
Soal: "${question.text}"
Jawaban benar: "${correctText}"
Jawaban siswa: "${userText}"`;

  const EXPLAIN_INSTRUCTIONS = {
    utama: `TUGAS AI UTAMA - JELASKAN KESALAHAN SISWA:
Jelaskan konsep yang benar secara mendalam untuk soal ini.
1. ANALISIS SOAL: Apa yang ditanyakan dan apa jebakan yang mungkin ada.
2. PENJELASAN KUNCI: Mengapa jawaban benar adalah yang paling tepat secara logis.
3. ANALISIS KESALAHAN: Mengapa jawaban siswa salah dan apa miskonsepsi yang mungkin terjadi.
4. TIPS JITU: Berikan cara cepat atau cara mudah mengingat konsep ini di masa depan.

ATURAN:
- Gunakan bahasa yang ramah untuk siswa SMP.
- Panjang tulisan minimal 150-200 kata.
- FORMAT: TEKS POLOS MURNI.
- DILARANG menggunakan markdown.`,
    korektor: "Pastikan penjelasan akurat secara materi dan mudah dipahami siswa SMP. Tambahkan detail jika terlalu singkat.",
    penyempurna: "Sempurnakan bahasa agar mengalir alami dan tetap pertahankan panjang teks. Hapus semua markdown."
  };

  return await queryWithPipeline(prompt, 0.7, EXPLAIN_INSTRUCTIONS);
};
