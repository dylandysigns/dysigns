// Types for detectLang.js (plain JS so the Cloudflare function can import it as is).
export type ChatLang = "nl" | "en";
export function requestedLang(text: string): ChatLang | null;
export function leanLang(text: string): ChatLang | null;
export function detectLang(userTurns: string[], fallback: ChatLang): ChatLang;
