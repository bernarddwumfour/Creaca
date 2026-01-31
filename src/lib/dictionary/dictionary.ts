import { commonDict } from './common';
import { homeDict } from './home';
import { aboutDict } from './about'; // Create this when ready
import { contactDict } from './contact';
import { coursesDict } from './courses';

export const dict = {
  en: {
    ...commonDict.en,
    pages: {
      home: homeDict.en,
      about: aboutDict.en,
      contact: contactDict.en,
      courses: coursesDict.en,


    }
  },
  fr: {
    ...commonDict.fr,
    pages: {
      home: homeDict.fr,
      about: aboutDict.fr,
      contact: contactDict.fr,
      courses: coursesDict.fr,
    }
  },
  es: {
    ...commonDict.es,
    pages: {
      home: homeDict.es,
      about: aboutDict.es,
      contact: contactDict.es,
      courses: coursesDict.es,
    }
  }
};

export type Lang = keyof typeof dict;