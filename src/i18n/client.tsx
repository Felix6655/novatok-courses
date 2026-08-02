"use client";
import { createContext, useContext } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
const I18nContext=createContext<{dictionary:Dictionary;locale:Locale}|null>(null);
export function I18nProvider({dictionary,locale,children}:{dictionary:Dictionary;locale:Locale;children:React.ReactNode}){return <I18nContext.Provider value={{dictionary,locale}}>{children}</I18nContext.Provider>;}
export function useI18n(){const value=useContext(I18nContext);if(!value)throw new Error("I18nProvider is missing");return value;}
