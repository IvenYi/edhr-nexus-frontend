import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { renderI18nTranslate, i18nLocaleStore, i18nConfigList } from './useLocale';
import { setHtmlPageLang } from './helper';

import { getI18nConfigList } from '/@/apis/gct-platform/I18nConfigController';

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  sync: true, //If you don’t want to inherit locale from global scope, you need to set sync of i18n component option to false.
  silentTranslationWarn: true, // true - warning off
  missingWarn: false,
  silentFallbackWarn: true,
});

// setup i18n instance with glob
export async function setupI18n(app: App) {
  const locale: any = await getCurrentLocale();
  (i18n.global.locale as any).value = locale;
  window.$t = i18n.global.t;
  setHtmlPageLang(locale);
  renderI18nTranslate(locale);
  app.use(i18n);
}

/**初始化获取当前国际化配置 */
async function getCurrentLocale() {
  const locales = await reloadI18nConfigList();
  if (!i18nLocaleStore.value) {
    i18nLocaleStore.value = locales.find((i) => i.defaultLanguage)?.locale || 'zh-CN';
  }
  return i18nLocaleStore.value;
}
/**初始化加载列表 */
async function reloadI18nConfigList() {
  if (!i18nConfigList.value.length) {
    const res = await getI18nConfigList();
    i18nConfigList.value = res
      .filter((i) => i.configured && i.state)
      .map((i) => {
        return { label: i.language!, locale: i.languageTag! };
      });
  }
  return i18nConfigList.value;
}
