import { headers } from "next/headers";
import { normalizeLocale } from "./config";
export async function getRequestLocale(){ return normalizeLocale((await headers()).get("x-novatok-locale")); }