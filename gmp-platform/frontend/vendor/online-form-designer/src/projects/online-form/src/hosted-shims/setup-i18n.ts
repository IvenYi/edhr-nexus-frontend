import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import antdLocaleCn from 'ant-design-vue/es/locale/zh_CN';
import { defaultLocaleFlat, setHtmlPageLang, setLoadLocalePool } from '@/locales/helper';

const locale = 'zh-CN';

export const antdMap = {
  [locale]: antdLocaleCn,
};

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: locale,
  sync: true,
  silentTranslationWarn: true,
  missingWarn: false,
  silentFallbackWarn: true,
});

if (typeof window !== 'undefined') {
  const gct = (window as any)._gct;
  if (gct) {
    gct.i18n = i18n as any;
  }
  (window as any).__GCT_I18N__ = i18n;
  window.$t = i18n.global.t;
}

function setHostedDefaultLocaleMessage() {
  const message = {
    ...defaultLocaleFlat,
    antdLocale: antdLocaleCn,
  };

  setHtmlPageLang(locale);
  setLoadLocalePool((loadLocalePool) => {
    if (!loadLocalePool.includes(locale)) {
      loadLocalePool.push(locale);
    }
  });
  i18n.global.setLocaleMessage(locale, message);
  (i18n.global.locale as any).value = locale;
}

export async function setupI18n(app: App) {
  setHostedDefaultLocaleMessage();
  app.use(i18n);
}

export async function updateAppointI18nMessage({ i18nKey, i18nMessage }) {
  if (!i18nKey || !i18nMessage?.[locale]) {
    return;
  }
  const currentMessage = i18n.global.getLocaleMessage(locale);
  i18n.global.setLocaleMessage(locale, {
    ...currentMessage,
    [i18nKey]: i18nMessage[locale],
  });
}
