import type { DropMenu } from '../components/Dropdown';
import type { LocaleSetting, LocaleType } from '/#/config';

export const LOCALE: { [key: string]: LocaleType } = {
  ['ZH-CN']: 'zh-CN',
  // EN_US: 'en',
};

export const localeSetting: LocaleSetting = {
  // Locale
  locale: LOCALE['ZH-CN'],
  // Default locale
  fallback: LOCALE['ZH-CN'],
  // available Locales
  // availableLocales: [LOCALE['ZH-CN'], LOCALE.EN_US],
  availableLocales: [LOCALE['ZH-CN']],
};

// locale list
export const localeList: DropMenu[] = [
  {
    text: '简体中文',
    event: LOCALE['ZH-CN'],
  },
  // {
  //   text: 'English',
  //   event: LOCALE.EN_US,
  // },
];
