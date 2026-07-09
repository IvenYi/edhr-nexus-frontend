/**
 * Multi-language related operations
 */
import type { LocaleType } from '#/config';
import { i18n } from './setupI18n';
import { ref, computed, reactive } from 'vue';
import request from '@mobile/utils/request';
import { useLocalStorage } from '@vueuse/core';
import { loadLocalePool, setHtmlPageLang, defaultLocaleFlat } from './helper';
import vantLocaleCn from 'vant/es/locale/lang/zh-CN';
import vantLocaleUs from 'vant/es/locale/lang/en-US';
import vantLocalePt from 'vant/es/locale/lang/pt-BR';
import vantLocaleTr from 'vant/es/locale/lang/tr-TR';
import vantLocaleTw from 'vant/es/locale/lang/zh-TW';
import vantLocaleJp from 'vant/es/locale/lang/ja-JP';
import vantLocaleVn from 'vant/es/locale/lang/vi-VN';
import vantLocaleDe from 'vant/es/locale/lang/de-DE';
import vantLocaleFr from 'vant/es/locale/lang/fr-FR';
import vantLocaleEs from 'vant/es/locale/lang/es-ES';
import vantLocaleRu from 'vant/es/locale/lang/ru-RU';
import { getEnvCode } from '@mobile/utils/useEnv';
import {
  getBranchId,
  getIsMobileRender,
  getAidForLocale,
} from '@mobile/stores/loginHooks';

export const i18nLocaleStore = useLocalStorage<LocaleType>('I18N_LOCALE', '');
export const i18nConfigList = ref<{ label: string; locale: LocaleType }[]>([]);
export const getCurrentLocale = computed(() => {
  return i18nConfigList.value.find((i) => i.locale === i18nLocaleStore.value) || {};
});
const vantMap = reactive({
  'zh-CN': vantLocaleCn,
  'en-US': vantLocaleUs,
  'pt-BR': vantLocalePt,
  'tr-TR': vantLocaleTr,
  'zh-TW': vantLocaleTw,
  'ja-JP': vantLocaleJp,
  'vi-VN': vantLocaleVn,
  'de-GE': vantLocaleDe,
  'fr-FR': vantLocaleFr,
  'es-ES': vantLocaleEs,
  'ru-RU': vantLocaleRu,
});
const isMobileRender = getIsMobileRender();

export function setI18nLanguage(locale: LocaleType) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    (i18n.global.locale as any).value = locale;
  }
  setHtmlPageLang(locale);
}

export function getI18nTranslate(locale?: string) {
  if (locale) {
    const p = [
      request({
        url: `/minio/locale-js/${locale}__platform__.json`,
        method: 'get',
      }),
    ];
    const appId = getAidForLocale();
    if (isMobileRender && appId) {
      const env = getEnvCode();
      const branchId = getBranchId();
      const branch = env === 'dev' ? '_' + branchId : '';
      p.push(
        request(
          { url: `/minio/${appId}/locale-js/${env==='sbx'?'prod':env}${branch}/${locale}__.json`, method: 'get'},
          { joinPrefix: false, isTransformResponse: false, ignore404: true },
        ),
      );
    }
    return Promise.allSettled(p).then((res) => {
      return res?.filter(item => item.status === "rejected")?.map(item => item.reason)?.join('\n');
    });
  }
  return request({ url: '/minio/locale-js/__platform__.json', method: 'get' });
}

export function renderI18nTranslate(locale: any) {
  getI18nTranslate(locale)
    ?.then((results) => { 
      const localeItems = results;
      setI18nTranslate(localeItems, locale);
    })
    .catch((res) => {
      console.log('获取国际化文件失败----', res);
    });
}

export function setI18nTranslate(localeItems: any, locale: string) {
  const i18nTranslate: any = [];
  i18nTranslate[locale] = localeItems.split('\n').reduce(
    (arr: any, item: any) => {
      // 防止翻译内容中出现":"
      const [key, ...value] = item.split(':');
      arr[key] = value.join(':');
      return arr;
    },
    { ...defaultLocaleFlat },
  );
  if (!i18nTranslate[locale].antdLocale) {
    i18nTranslate[locale].antdLocale = vantMap[locale];
  }
  i18n.global.setLocaleMessage(locale, i18nTranslate[locale]);
}

/**
 * 切换语言
 * @param locale
 * @returns
 */
export async function changeLocale(locale: LocaleType) {
  if (i18nLocaleStore.value === locale) return locale;
  if (!loadLocalePool.includes(locale)) {
    renderI18nTranslate(locale);
    loadLocalePool.push(locale);
  }
  setI18nLanguage(locale);
  if (window._gct) {
    _gct.store.lang = locale;
  }
  i18nLocaleStore.value = locale;
  return locale;
}
