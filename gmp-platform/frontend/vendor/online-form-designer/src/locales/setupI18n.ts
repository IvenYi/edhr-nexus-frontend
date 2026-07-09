import type { App } from 'vue';
import { setI18nLanguage } from '/@/locales/useLocale';
import { createI18n } from 'vue-i18n';
import { setHtmlPageLang, setLoadLocalePool, defaultLocaleFlat } from './helper';
import { localeSetting } from '/@/settings/localeSetting';
import { useLocaleStoreWithOut } from '/@/store/modules/locale';
import antdLocaleCn from 'ant-design-vue/es/locale/zh_CN';
import antdLocaleUs from 'ant-design-vue/es/locale/en_US';
import antdLocalePt from 'ant-design-vue/es/locale/pt_PT';
import antdLocaleTr from 'ant-design-vue/es/locale/tr_TR';
import antdLocaleTw from 'ant-design-vue/es/locale/zh_TW';
import antdLocaleJp from 'ant-design-vue/es/locale/ja_JP';
import antdLocaleVn from 'ant-design-vue/es/locale/vi_VN';
import antdLocaleDe from 'ant-design-vue/es/locale/de_DE';
import antdLocaleFr from 'ant-design-vue/es/locale/fr_FR';
import antdLocaleEs from 'ant-design-vue/es/locale/es_ES';
import antdLocaleRu from 'ant-design-vue/es/locale/ru_RU';
import { has } from 'lodash-es';
import { LocaleType } from '/#/config';

const { fallback } = localeSetting;
interface SetupI18nOptions {
  loadRemote?: boolean;
}

export const antdMap = {
  'zh-CN': antdLocaleCn,
  'en-US': antdLocaleUs,
  'pt-PT': antdLocalePt,
  'tr-TR': antdLocaleTr,
  'zh-TW': antdLocaleTw,
  'ja-JP': antdLocaleJp,
  'vi-VN': antdLocaleVn,
  'de-GE': antdLocaleDe,
  'fr-FR': antdLocaleFr,
  'es-ES': antdLocaleEs,
  'ru-RU': antdLocaleRu,
};

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: fallback,
  sync: true, //If you don’t want to inherit locale from global scope, you need to set sync of i18n component option to false.
  silentTranslationWarn: true, // true - warning off
  missingWarn: false,
  silentFallbackWarn: true,
});
if (window._gct) {
  _gct.i18n = i18n as any;
}
(window as any).__GCT_I18N__ = i18n;
window.$t = i18n.global.t;
async function setI18nLocaleMessage(): Promise<void> {
  const localeStore = useLocaleStoreWithOut();
  await localeStore.getLocaleList();
  const locale = localeStore.getLocale;
  await localeStore.getI18nTranslate(locale);
  setHtmlPageLang(locale);
  setLoadLocalePool((loadLocalePool) => {
    loadLocalePool.push(locale);
  });
  localeStore.localeList
    .filter((d) => d.configured === 1 && d.state === 1)
    .forEach(async (locale) => {
      const map = { ...localeStore.getI18nTransMap };
      map[locale.languageTag] = { ...defaultLocaleFlat, ...map[locale.languageTag] };
      map[locale.languageTag].antdLocale = antdMap[locale.languageTag];
      localeStore.setI18nTransMap(map);
    });
  //判断当前缓存中的语言是否被禁用 如果被禁用则选择默认语种
  if (localeStore.localeList.find((l) => locale === l.languageTag && l.state === 1)) {
    setI18nLanguage(locale);
  } else {
    const defaultLang = localeStore.localeList.find((l) => l.defaultLanguage === 1);
    setI18nLanguage((defaultLang?.languageTag ?? 'zh-CN') as LocaleType);
  }
  for (const locale in localeStore.getI18nTransMap) {
    i18n.global.setLocaleMessage(locale, localeStore.getI18nTransMap[locale]);
  }
}

function setDefaultI18nLocaleMessage(): void {
  const localeStore = useLocaleStoreWithOut();
  const locale = (localeStore.getLocale || 'zh-CN') as LocaleType;
  const message = {
    ...defaultLocaleFlat,
    antdLocale: antdMap[locale] ?? antdMap['zh-CN'],
  };

  localeStore.setI18nTransMap({
    ...localeStore.getI18nTransMap,
    [locale]: message,
  });
  setHtmlPageLang(locale);
  setLoadLocalePool((loadLocalePool) => {
    if (!loadLocalePool.includes(locale)) {
      loadLocalePool.push(locale);
    }
  });
  setI18nLanguage(locale);
  i18n.global.setLocaleMessage(locale, message);
}

/** 更新指定的国际化内容 */
export async function updateAppointI18nMessage({ i18nKey, i18nMessage }) {
  if (!i18nKey) {
    console.warn('国际化key不能为空');
    return;
  }

  const localeStore = useLocaleStoreWithOut();
  const locale = localeStore.getLocale;
  if (has(localeStore.getI18nTransMap[locale], i18nKey)) {
    const map = { ...localeStore.getI18nTransMap };
    Object.assign(map[locale], { [i18nKey]: i18nMessage[locale] });
    localeStore.setI18nTransMap(map);
    i18n.global.setLocaleMessage(locale, localeStore.getI18nTransMap[locale]);
  } else {
    console.warn('要更新的key不在国际化集合中');
  }
}

// setup i18n instance with glob
export async function setupI18n(app: App, options: SetupI18nOptions = {}) {
  const { loadRemote = true } = options;

  if (loadRemote) {
    await setI18nLocaleMessage();
  } else {
    setDefaultI18nLocaleMessage();
  }
  // i18n = createI18n(options) as I18n;
  // window.console.log(i18n)
  app.use(i18n);
}
