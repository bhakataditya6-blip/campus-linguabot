/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/** Languages supported by the assistant */
export type LanguageCode = "en" | "hi" | "bn" | "mr" | "ta";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  language: LanguageCode;
  timestamp: number;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  language?: LanguageCode; // optional if auto-detected
}

export interface ChatResponse {
  sessionId: string;
  answer: string;
  language: LanguageCode;
  intent?: string;
  confidence: number; // 0..1
  fallbackToHuman: boolean;
  contextTopic?: string;
}

export interface HandoffRequestBody {
  sessionId: string;
  name: string;
  email?: string;
  phone?: string;
  note?: string;
}

export interface HandoffResponse {
  ok: true;
}
