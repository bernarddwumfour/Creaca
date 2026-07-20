import { commonDict } from './common';
import { homeDict } from './home';
import { aboutDict } from './about';
import { contactDict } from './contact';
import { coursesDict } from './courses';
import { faqDict } from './faqs';
import { paymentsDict } from './payments';
import { notificationsDict } from './notifications';
import { authDict } from './auth';
import { learnerDict } from './learner';

export const dict = {
  en: {
    ...commonDict.en,
    pages: {
      home: homeDict.en,
      about: aboutDict.en,
      contact: contactDict.en,
      courses: coursesDict.en,
      faqs: faqDict.en,
      payments: paymentsDict.en,
      notifications: notificationsDict.en,
      auth: authDict.en,
      learner: learnerDict.en,


    }
  },
  fr: {
    ...commonDict.fr,
    pages: {
      home: homeDict.fr,
      about: aboutDict.fr,
      contact: contactDict.fr,
      courses: coursesDict.fr,
      faqs: faqDict.fr,
      payments: paymentsDict.fr,
      notifications: notificationsDict.fr,
      auth: authDict.fr,
      learner: learnerDict.fr,
    }
  },
  es: {
    ...commonDict.es,
    pages: {
      home: homeDict.es,
      about: aboutDict.es,
      contact: contactDict.es,
      courses: coursesDict.es,
      faqs: faqDict.es,
      payments: paymentsDict.es,
      notifications: notificationsDict.es,
      auth: authDict.es,
      learner: learnerDict.es,
    }
  }
};

export type Lang = keyof typeof dict;
