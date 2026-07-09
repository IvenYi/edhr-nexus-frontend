import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import zhCN from '/@/locales/lang/zh-CN';

const locale = 'zh-CN';

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: locale,
  sync: true,
  silentTranslationWarn: true,
  missingWarn: false,
  silentFallbackWarn: true,
  messages: {
    [locale]: zhCN.message,
  },
});

if (window._gct) {
  _gct.i18n = i18n as any;
}
(window as any).__GCT_I18N__ = i18n;
window.$t = i18n.global.t;
document.querySelector('html')?.setAttribute('lang', locale);

export const antdLocale = zhCN.message.antdLocale;

export function setupLocalI18n(app: App) {
  app.use(i18n);
}
