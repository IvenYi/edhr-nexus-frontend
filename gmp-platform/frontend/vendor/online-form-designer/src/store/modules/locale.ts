import type { LocaleSetting, LocaleType } from '/#/config';
import type { I18nTranslateMap, LocaleTypeListDto } from '/#/store';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { LOCALE_KEY, LOCALE_LIST_KEY, LOCAL_I18N_TRANSLATE } from '/@/enums/cacheEnum';
import { createLocalStorage } from '/@/utils/cache';
import { localeSetting } from '/@/settings/localeSetting';
import {
  I18nAddOrEditApi,
  I18nDeleteApi,
  I18nPageListApi,
  updateLocaleApi,
  getI18nTranslate,
} from '/@/api/sys/locale';
import { getI18nConfigList } from '/@/apis/gct-platform/I18nConfigController';
import { I18nInfo, I18nPageListReq, I18nPageListRes } from '/@/api/model/localeModel';
import { defaultLocaleFlat } from '/@/locales/helper';
import { antdMap } from '/@/locales/setupI18n';

const ls = createLocalStorage();

const lsLocaleSetting = ls.get(LOCALE_KEY) as LocaleSetting;

interface LocaleState {
  localInfo: LocaleSetting;
  localeList: Array<LocaleTypeListDto>;
  i18nTranslate: I18nTranslateMap;
}

export const useLocaleStore = defineStore({
  id: 'app-locale',
  state: (): LocaleState => ({
    localInfo: lsLocaleSetting,
    localeList: [
      {
        id: '001',
        configured: 1,
        defaultLanguage: 1,
        language: '简体中文',
        languageTag: 'zh-CN',
        state: 1,
      },
    ],
    i18nTranslate: {},
  }),
  getters: {
    getLocale(state): LocaleType {
      // return state.localInfo?.locale ?? 'zh-CN';
      const locale = state.localeList.find((d) => d.defaultLanguage === 1);
      return state.localInfo?.locale ?? locale?.languageTag;
    },
    getEnableLocaleList(state): Array<LocaleTypeListDto> {
      return state.localeList.filter((d) => {
        return d.configured === 1 && d.state === 1;
      });
    },
    getI18nTransMap(state) {
      return state.i18nTranslate || {};
    },
  },
  actions: {
    setI18nTransMap(i18nTranslate) {
      this.i18nTranslate = i18nTranslate;
      ls.set(LOCAL_I18N_TRANSLATE, this.i18nTranslate);
    },
    setLocaleList(localeList) {
      this.localeList = localeList;
      ls.set(LOCALE_LIST_KEY, this.localeList);
    },

    /**
     * 加载翻译内容
     * @param locale 语言
     */
    async getI18nTranslate(locale?: LocaleType) {
      if (locale) {
        const localeItems = await getI18nTranslate(locale);
        this.i18nTranslate[locale] = localeItems.split('\n').reduce(
          (map, item) => {
            // 防止翻译内容中出现":"
            const [key, ...value] = item.split(':');
            map[key] = value.join(':');
            return map;
          },
          { ...defaultLocaleFlat },
        );
        if (!this.i18nTranslate[locale].antdLocale) {
          this.i18nTranslate[locale].antdLocale = antdMap[locale];
        }
      } else {
        const i18nList = await getI18nTranslate();
        const langList = this.getEnableLocaleList.map((d) => d.languageTag);
        langList.forEach((lang) => {
          this.i18nTranslate[lang] = {};
          i18nList.forEach((locale) => {
            const find = locale.info.find((d) => {
              return d.locale === lang;
            });
            if (find) {
              this.i18nTranslate[lang][locale.key] = find.info;
            }
          });
        });
      }

      ls.set(LOCAL_I18N_TRANSLATE, this.i18nTranslate);
    },
    async getLocaleList() {
      try {
        const data = await getI18nConfigList();
        const localeList = data?.map((locale) => {
          return {
            id: locale.id,
            configured: locale.configured,
            defaultLanguage: locale.defaultLanguage,
            language: locale.language,
            languageTag: locale.languageTag,
            state: locale.state,
          };
        });
        this.setLocaleList(localeList);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    /**
     * 更新语言列表中语言的状态
     */
    async updateLocale(id, data) {
      await updateLocaleApi(id, data);
      return this.getLocaleList();
    },
    /**
     * Set up multilingual information and cache
     * @param info multilingual info
     */
    setLocaleInfo(info: Partial<LocaleSetting>) {
      this.localInfo = { ...this.localInfo, ...info };
      ls.set(LOCALE_KEY, this.localInfo);
    },
    /**
     * Initialize multilingual information and load the existing configuration from the local cache
     */
    initLocale() {
      this.setLocaleInfo({
        // ...localeSetting,
        ...this.localInfo,
      });
    },

    // 翻译管理 获取分页列表数据
    async getI18nPageList(params: I18nPageListReq): Promise<I18nPageListRes> {
      try {
        const data = await I18nPageListApi(params);
        return data;
      } catch (err) {
        return Promise.reject(err);
      }
    },

    // 翻译管理 删除
    async I18nDelete(params: { ids: string }) {
      try {
        await I18nDeleteApi(params);
      } catch (err) {
        return Promise.reject(err);
      }
    },

    // 翻译管理 添加/修改
    async I18nAddOrEdit(params: string, data: I18nInfo) {
      try {
        await I18nAddOrEditApi(params, data);
      } catch (err) {
        Promise.reject(err);
      }
    },
  },
});

// Need to be used outside the setup
export function useLocaleStoreWithOut() {
  return useLocaleStore(store);
}
