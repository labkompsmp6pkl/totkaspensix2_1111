/**
 * @file config.ts
 * @description Shared configuration for OpenRouter AI services.
 */

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * API Key retrieval with fallback mechanism.
 */
export const OPENROUTER_API_KEY = 
  (import.meta as any).env?.VITE_OPENROUTER_API_KEY || 
  (typeof process !== 'undefined' ? process.env.OPENROUTER_API_KEY : '') || 
  "";

/**
 * AI PIPELINE DEFINITION
 * Uses a sequence of models to ensure high-quality, corrected, and polished output.
 */
export const FALLBACK_MODEL = "openrouter/free";

export const PIPELINE = [
  { 
    id: "openrouter/free", 
    role: "utama", 
    reasoning: true,
    desc: "AI Utama - Penulis Draft Awal",
    temp: 0.8
  },
  { 
    id: "openrouter/free", 
    role: "korektor", 
    reasoning: false,
    desc: "AI Korektor - Memperbaiki struktur dan logika",
    temp: 0.5
  },
  { 
    id: "openrouter/free", 
    role: "penyempurna", 
    reasoning: false,
    desc: "AI Penyempurna - Membuat bahasa lebih mengalir",
    temp: 0.6
  }
];
