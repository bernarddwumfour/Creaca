import { commonDict } from './common';
import { homeDict } from './home';
import { aboutDict } from './about'; // Create this when ready

export const dict = {
  en: {
    ...commonDict.en,
    pages: {
      home: homeDict.en,
      about: aboutDict.en,
    }
  },
  fr: {
    ...commonDict.fr,
    pages: {
      home: homeDict.fr,
      about: aboutDict.fr,
    }
  },
  es: {
    ...commonDict.es,
    pages: {
      home: homeDict.es,
      about: aboutDict.es,
    }
  }
};

export type Lang = keyof typeof dict;