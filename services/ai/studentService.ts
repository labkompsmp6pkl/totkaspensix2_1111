/**
 * @file studentAiService.ts
 * @description AI services specifically for student features (Roadmap, Motivation, Personal Analysis).
 */

import { queryWithPipeline } from "./pipeline";

/**
 * SYSTEM INSTRUCTIONS - CAREER ROADMAP
 */
const ROADMAP_INSTRUCTIONS: Record<string, string> = {
  utama: `TUGAS AI UTAMA - TULIS DRAFT AWAL:
Tulis peta jalan karir yang mencakup:
1. PEMBUKAAN yang hangat: Sambut siswa dan hargai impiannya. Jelaskan bahwa profesi ini mulia dan jadi fondasi pembangunan.
2. JALUR PENDIDIKAN (SPESIFIK): Rekomendasi SMA (IPS/IPA), SMK (sebutkan nama jurusan spesifik), dan Kuliah (jurusan tepat).
3. MANFAAT BAHASA INDONESIA: Jelaskan kaitan membaca pemahaman, komunikasi lisan, dan menulis laporan dengan profesi tersebut. Beri CONTOH KONKRET.
4. MANFAAT MATEMATIKA: Jelaskan kaitan perhitungan volume, skala, luas, atau anggaran dengan profesi tersebut. Beri CONTOH KONKRET.
5. PENUTUP: Hubungkan materi TKA dengan kesuksesan masa depan. Beri motivasi tulus.

ATURAN KHUSUS:
- Gunakan bahasa Indonesia yang jelas dan sederhana.
- Panjang tulisan 300-400 kata.
- FORMAT: TEKS POLOS MURNI.
- DILARANG KERAS menggunakan simbol markdown (#, *, _, -, >, •).
- JANGAN gunakan format poin-poin atau numbering.
- TULIS DALAM BENTUK PARAGRAF YANG MENGALIR.`,

  korektor: `TUGAS AI KOREKTOR - PERBAIKI DRAFT INI:
Perbaiki draft dengan TELITI:
1. Struktur tulisan - pastikan alurnya LOGIS: Pembukaan → Jalur Pendidikan → Manfaat Bahasa Indonesia → Manfaat Matematika → Penutup.
2. Kebenaran informasi - cek apakah rekomendasi jurusan sudah tepat untuk profesi tersebut.
3. Kelengkapan - pastikan semua bagian (pembukaan, jalur pendidikan, manfaat Bahasa Indonesia, manfaat Matematika, penutup) ADA SEMUA.
4. Contoh konkret - pastikan setiap manfaat mapel disertai CONTOH NYATA di lapangan.
5. Kaitan dengan TKA - pastikan ada hubungannya dengan materi ujian yang sedang dipelajari.

ATURAN KHUSUS:
- Perbaiki tanpa mengubah maksud utama dan informasi penting.
- Tambahkan bagian yang kurang.
- Rapikan kalimat yang ambigu atau tidak jelas.
- FORMAT: TEKS POLOS MURNI.
- DILARANG KERAS menggunakan simbol markdown APAPUN.`,

  penyempurna: `TUGAS AI PENYEMPURNA - BUAT TEKS INI MENJADI FINAL:
Sempurnakan teks agar menjadi HASIL AKHIR yang siap dibaca siswa.
1. ALUR ANTAR PARAGRAF - pastikan NYAMBUNG dan mengalir alami.
2. PILIHAN KATA - gunakan kata yang tepat, berwibawa, dan mudah dipahami siswa SMP.
3. NADA BICARA - seperti guru BK yang bijak, hangat, and tulus menyemangati muridnya.
4. MOTIVASI - tambahkan semangat yang tulus tanpa berlebihan di bagian penutup.
5. PERTAHANKAN PANJANG TEKS: Jangan meringkas teks. Pastikan semua detail dari tahap sebelumnya tetap ada, hanya diperhalus bahasanya.

PERINTAH TEGAS:
- HAPUS SEMUA simbol markdown (#, *, _, -, >, •) jika masih ada.
- Pastikan teks 100% BERSIH and siap dibaca siswa.
- HASIL AKHIR HARUS BERUPA TEKS POLOS MURNI, TANPA SATU PUN SIMBOL ANEH.
- TIDAK BOLEH ADA FORMAT POIN-POIN ATAU NUMBERING.`
};

/**
 * ANALYSIS INSTRUCTIONS - INDIVIDUAL STUDENT PERFORMANCE
 */
const ANALYSIS_INSTRUCTIONS: Record<string, string> = {
  utama: `TUGAS AI UTAMA - TULIS DRAFT ANALISIS:
Berdasarkan data performa dan data soal, buatlah analisis mendalam yang mencakup:
1. PEMBUKAAN yang personal dan hangat: Sapa siswa, apresiasi usahanya, sampaikan tujuan analisis.
2. ANALISIS POLA JAWABAN (WAJIB DETAIL): Identifikasi 3-5 soal yang paling banyak membuat siswa terkecoh. Jelaskan topik, alasan terkecoh, dan solusi. Kelompokkan berdasarkan pola kesalahan (kurang teliti, konsep, jebakan, waktu).
3. ANALISIS PER MATA PELAJARAN: Fokus pada mapel terlemah.
4. SARAN BELAJAR YANG SPESIFIK (BUKAN UMUM): Rekomendasikan cara belajar berdasarkan pola kesalahan dan sebutkan sumber belajar.
5. MOTIVASI DAN PENUTUP: Hubungkan dengan impian masa depan dan beri semangat.

ATURAN KHUSUS:
- Gunakan bahasa Indonesia yang jelas dan sederhana.
- Panjang tulisan 400-500 kata.
- FORMAT: TEKS POLOS MURNI.
- DILARANG KERAS menggunakan simbol markdown (#, *, _, -, >, •).
- JANGAN gunakan format poin-poin atau numbering.
- TULIS DALAM BENTUK PARAGRAF YANG MENGALIR.
- SETIAP ANALISIS SOAL HARUS DISERTAI CONTOH KONKRET DARI SOAL YANG DIKERJAKAN.`,

  korektor: `TUGAS AI KOREKTOR - PERBAIKI DRAFT INI:
Perbaiki draft analisis dengan TELITI:
1. KETEPATAN ANALISIS SOAL: Verifikasi identifikasi soal yang membuat siswa terkecoh dengan data soal asli (ID, teks, jawaban).
2. KELENGKAPAN ANALISIS: Pastikan semua bagian ada, minimal 3 soal dianalisis detail.
3. KETERKAITAN DENGAN MAPEL TERLEMAH: Pastikan mapel terlemah jadi fokus utama.
4. KONKRETISASI SARAN: Pastikan saran belajar spesifik dan praktis.

ATURAN KHUSUS:
- Perbaiki tanpa mengubah maksud utama.
- Tambahkan bagian yang kurang, terutama analisis soal yang lebih detail.
- FORMAT: TEKS POLOS MURNI.
- DILARANG KERAS menggunakan simbol markdown APAPUN.`,

  penyempurna: `TUGAS AI PENYEMPURNA - BUAT TEKS INI MENJADI FINAL:
Sempurnakan teks agar menjadi HASIL AKHIR yang siap dibaca oleh siswa dan orang tuanya.
1. ALUR ANTAR PARAGRAF: Pastikan transisi alami dan nyambung.
2. PILIHAN KATA: Gunakan kata yang tepat, berwibawa, dan mudah dipahami.
3. NADA BICARA: Seperti guru BK atau wali kelas yang bijak, hangat, dan tulus.
4. KEJELASAN ANALISIS SOAL: Pastikan penjelasan mudah dipahami dan beri tips jitu.
5. MOTIVASI: Sempurnakan bagian motivasi agar lebih menyentuh.
6. PERTAHANKAN PANJANG TEKS: Jangan meringkas teks. Pastikan semua detail dari tahap sebelumnya tetap ada, hanya diperhalus bahasanya.

PERINTAH TEGAS:
- HAPUS SEMUA simbol markdown (#, *, _, -, >, •) jika masih ada.
- Pastikan teks 100% BERSIH and siap dibaca siswa.
- HASIL AKHIR HARUS BERUPA TEKS POLOS MURNI, TANPA SATU PUN SIMBOL ANEH.
- TIDAK BOLEH ADA FORMAT POIN-POIN ATAU NUMBERING.`
};

/**
 * Generates a career roadmap based on student's dream job.
 */
export const getCareerRoadmap = async (inputDream: string, studentName: string): Promise<string> => {
  const prompt = `Siswa SMPN 06 Pekalongan bernama ${studentName} memiliki impian menjadi: "${inputDream}".

Tulis peta jalan karir yang mencakup pembukaan hangat, jalur pendidikan spesifik (SMA/SMK/Kuliah), manfaat Bahasa Indonesia dan Matematika dengan contoh konkret, serta penutup motivasi.`;

  return await queryWithPipeline(prompt, 0.8, ROADMAP_INSTRUCTIONS);
};

/**
 * Generates a detailed performance analysis for an individual student.
 */
export const getDetailedStudentAnalysis = async (studentName: string, stats: any, questionsData: any[]): Promise<string> => {
  const prompt = `Siswa SMPN 06 Pekalongan bernama ${studentName} telah menyelesaikan Try Out TKA.
Data: Akurasi ${stats.accuracy}%, Kecepatan ${stats.avgTime}s/soal, Mapel Terlemah ${stats.weakestSubject}.
Data Soal: ${JSON.stringify(questionsData.slice(0, 10))}`; // Slice to avoid token limits

  return await queryWithPipeline(prompt, 0.8, ANALYSIS_INSTRUCTIONS);
};

/**
 * Generates a short motivational quote for students.
 */
export const generateMotivation = async (): Promise<string> => {
  const prompt = `Buat 1-2 kalimat motivasi untuk siswa SMP yang akan menghadapi Try Out TKA. Kalimat harus asli, inspiratif, dan berwibawa. TEKS POLOS MURNI, tanpa tanda kutip, tanpa simbol markdown.`;

  const MOTIVATION_INSTRUCTIONS = {
    utama: `TUGAS AI UTAMA - BUAT MOTIVASI:
Buatlah 2-3 paragraf motivasi yang mendalam dan menyentuh hati untuk siswa SMP.
1. APRESIASI: Hargai kerja keras mereka sejauh ini.
2. VISI MASA DEPAN: Gambarkan bagaimana ujian ini adalah langkah kecil menuju impian besar mereka.
3. SEMANGAT: Berikan dorongan moral yang kuat agar mereka tidak menyerah.

ATURAN:
- Bahasa Indonesia yang indah, puitis namun tetap mudah dimengerti.
- Panjang minimal 100 kata.
- FORMAT: TEKS POLOS MURNI.`,
    korektor: "Pastikan nada bicara hangat dan inspiratif. Tambahkan kalimat yang lebih menggugah semangat.",
    penyempurna: "Sempurnakan pilihan kata agar lebih berwibawa dan menyentuh. Hapus markdown."
  };

  try {
    return await queryWithPipeline(prompt, 0.8, MOTIVATION_INSTRUCTIONS);
  } catch (e) {
    return "Fokus, teliti, dan percaya diri adalah kunci sukses Try Out hari ini.";
  }
};
