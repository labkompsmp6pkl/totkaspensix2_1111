/**
 * @file pipeline.ts
 * @description Core logic for the 3-stage AI generation pipeline.
 */

import { OPENROUTER_URL, OPENROUTER_API_KEY, PIPELINE, FALLBACK_MODEL } from "./config";

/**
 * Helper function to call OpenRouter API with retry logic.
 */
async function fetchAI(
  model: string,
  messages: any[],
  temperature: number,
  useReasoning: boolean
): Promise<{ ok: boolean; content?: string; error?: string; status?: number }> {
  const body: any = {
    model: model,
    temperature: temperature,
    max_tokens: 4000,
    messages: messages,
  };

  if (useReasoning) {
    body.reasoning = { enabled: true };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://totka2-1.vercel.app/",
        "X-Title": "TKA SMPN 06 Pekalongan Portal",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        ok: false, 
        error: data.error?.message || `Status ${response.status}`,
        status: response.status 
      };
    }

    const content = data.choices?.[0]?.message?.content;
    return { ok: true, content };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network Error" };
  }
}

/**
 * Core function with sequential correction pipeline - OPENROUTER ONLY!
 * This function handles the multi-stage AI generation process.
 */
export async function queryWithPipeline(
  initialPrompt: string, 
  temperature: number = 0.7,
  instructions: Record<string, string>
): Promise<string> {
  let currentText = "";

  console.log("==========================================");
  console.log("[AI-PIPELINE] MEMULAI PROSES KOREKSI BERANTAI");
  console.log("[AI-PIPELINE] MODEL: OPENROUTER (DILARANG GEMINI!)");
  console.log("==========================================");

  for (let i = 0; i < PIPELINE.length; i++) {
    const stage = PIPELINE[i];
    console.log(`\n========== TAHAP ${i + 1}: ${stage.desc} ==========`);
    
    // Construct the prompt for the current stage
    let stagePrompt = "";
    if (i === 0) {
      stagePrompt = initialPrompt;
    } else {
      const prevStage = PIPELINE[i-1].role;
      stagePrompt = `Berikut adalah teks yang sudah ${prevStage === 'utama' ? 'ditulis oleh AI sebelumnya' : prevStage === 'korektor' ? 'dikoreksi' : 'disempurnakan'}:\n\n========== TEKS DARI TAHAP SEBELUMNYA ==========\n${currentText}\n==============================================\n\n${instructions[stage.role]}`;
    }

    const messages = [
      { role: "system", content: instructions[stage.role] },
      { role: "user", content: stagePrompt }
    ];

    // 1. Try primary model
    console.log(`[AI-INFO] Mencoba model utama: ${stage.id}`);
    let result = await fetchAI(stage.id, messages, stage.temp || temperature, stage.reasoning);

    // 2. If failed with 400, retry without reasoning
    if (!result.ok && result.status === 400 && stage.reasoning) {
      console.log(`[AI-WARN] Model utama gagal (400). Mencoba tanpa reasoning...`);
      result = await fetchAI(stage.id, messages, stage.temp || temperature, false);
    }

    // 3. If still failed, try fallback model
    if (!result.ok) {
      console.error(`[AI-WARN] Model ${stage.role} (${stage.id}) gagal: ${result.error}`);
      console.log(`[AI-INFO] Mencoba model cadangan: ${FALLBACK_MODEL}`);
      result = await fetchAI(FALLBACK_MODEL, messages, stage.temp || temperature, false);
    }

    // 4. Handle final result of this stage
    if (result.ok && result.content) {
      // Length guard: If output is significantly shorter than input (for non-initial stages)
      // we suspect accidental summarization.
      if (i > 0 && result.content.length < currentText.length * 0.7) {
        console.warn(`[AI-WARN] Tahap ${stage.role} menghasilkan teks yang jauh lebih pendek (${result.content.length} vs ${currentText.length}). Mengabaikan hasil tahap ini untuk menjaga detail.`);
        // Keep currentText as is
      } else {
        currentText = result.content;
        console.log(`[AI-SUCCESS] Tahap ${stage.role} selesai! (${currentText.length} karakter)`);
      }
    } else {
      console.error(`[AI-ERROR] Tahap ${stage.role} gagal total: ${result.error}`);
      if (i === 0) {
        return "Maaf, asisten AI sedang mengalami gangguan teknis. Silakan coba lagi nanti.";
      }
      console.log(`[AI-INFO] Melanjutkan dengan teks dari tahap sebelumnya.`);
    }
  }

  /**
   * FINAL CLEANUP PHASE
   * Forcefully removes any remaining markdown symbols to ensure pure plain text.
   */
  if (currentText) {
    console.log("\n========== PEMBERSIHAN FINAL ==========");
    
    const markdownDetected = currentText.match(/[*#_>-]/g);
    if (markdownDetected) {
      console.log(`[AI-WARN] TERDETEKSI ${markdownDetected.length} simbol markdown! Membersihkan...`);
    }
    
    // Comprehensive regex-based markdown removal
    let finalText = currentText
      .replace(/\*/g, '')          // Remove all asterisks
      .replace(/#/g, '')           // Remove all hashes
      .replace(/_/g, '')           // Remove all underscores
      .replace(/-{2,}/g, '')       // Remove double dashes
      .replace(/>/g, '')           // Remove greater than signs
      .replace(/•/g, '')           // Remove bullet points
      .replace(/\n{3,}/g, '\n\n')   // Limit to max 2 newlines
      .trim();
    
    console.log(`[AI-SUCCESS] Teks final siap (${finalText.length} karakter)`);
    console.log("==========================================");
    
    return finalText;
  }

  return `Maaf, asisten AI sedang dalam perbaikan. Silakan coba lagi nanti.`;
}
