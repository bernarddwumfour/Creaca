import { dict, type Lang } from './dictionary';

export const getDictionary = (lang: string) => {
  return dict[lang as Lang] ?? dict.en;
};
