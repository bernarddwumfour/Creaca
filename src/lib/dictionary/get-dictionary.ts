import { dict, type Lang } from './dictionary';

/**
 * Grabs the full dictionary for the selected language.
 * Merged structure: { nav, footer, pages: { home, about, ... } }
 */
export const getDictionary = (lang: string) => {
  // Determine if the lang is valid, otherwise fallback to 'en'
  const selectedLang = (dict[lang as Lang] ? lang : 'en') as Lang;
  
  return dict[selectedLang];
};