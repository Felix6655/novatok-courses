import { z } from "zod";
export const SUPPORTED_LOCALES = ["en", "es", "pt", "fr", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const localeSchema = z.enum(SUPPORTED_LOCALES);
export const LOCALE_COOKIE = "novatok_locale";
export const LOCALE_NAMES: Record<Locale,string> = { en:"English", es:"Español", pt:"Português", fr:"Français", de:"Deutsch" };
export function isLocale(value:string): value is Locale { return (SUPPORTED_LOCALES as readonly string[]).includes(value); }
export function normalizeLocale(value:unknown): Locale { return typeof value === "string" && isLocale(value) ? value : DEFAULT_LOCALE; }
export const LANGUAGE_INSTRUCTIONS: Record<Locale,string> = {
 en:"Respond in English.", es:"Responde en español.", pt:"Responda em português.", fr:"Répondez en français.", de:"Antworte auf Deutsch.",
};