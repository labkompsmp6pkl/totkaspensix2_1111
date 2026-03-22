
import { Question } from '../types';
import { ensureArray, ensureObject, parseSafeDate } from '../utils';

/**
 * Menghitung skor dinamis berdasarkan jawaban siswa
 */
export const calculateDynamicScore = (qList: Question[], answersJson: any) => {
  let earned = 0;
  let max = 0;
  let answered = 0;
  let answers = ensureObject(answersJson);

  qList.forEach(q => {
    const ans = answers[q.id];
    if (ans !== undefined && ans !== null && ans !== "") answered++;

    if (q.type === 'single') {
      const correctOpt = q.options?.find(o => String(o.id).toLowerCase() === String(q.correctOptionId).toLowerCase());
      max += Number(correctOpt?.points) || Number(q.points) || 0;
      if (ans && String(ans).toLowerCase() === String(q.correctOptionId).toLowerCase()) {
        earned += Number(correctOpt?.points) || Number(q.points) || 0;
      }
    } else if (q.type === 'multiple') {
      const correctIds = q.correctOptionIds || [];
      const studentIds = ensureArray(ans);
      q.options?.forEach(o => {
        if (correctIds.includes(o.id)) {
          max += Number(o.points) || 0;
          if (studentIds.includes(o.id)) earned += Number(o.points) || 0;
        }
      });
    } else if (q.type === 'table') {
      q.statements?.forEach(st => {
        max += Number(st.points) || 0;
        if (String(ans?.[st.id] || '').trim().toUpperCase() === String(st.correctAnswer || '').trim().toUpperCase()) {
          earned += Number(st.points) || 0;
        }
      });
    }
  });

  return { earned, max, answered, total: qList.length };
};

/**
 * Menghitung durasi pengerjaan
 */
export const getDurationData = (startStr: string | null, endStr: string | null | undefined, now: number) => {
  const start = parseSafeDate(startStr);
  const end = (endStr ? parseSafeDate(endStr) : null) || new Date(now);

  if (!start || start.getFullYear() < 2024) return { str: "-", ms: 0 };

  let diff = end.getTime() - start.getTime();
  if (diff <= 0) return { str: "1s", ms: 1000 };

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return {
    str: h > 0 ? `${h}j ${m}m ${s}s` : `${m}m ${s}s`,
    ms: diff
  };
};
