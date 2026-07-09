import { computed, defineComponent, ref, watch } from 'vue';
import { copyTextToClipboard, useNamespace } from '@gct-paas/core';
import {
  EditorType,
  IEditForm,
  IFormContainer,
  IFormEditItem,
  ITextEditor,
  Platform,
  t,
} from '@gct/runtime';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { useDesigner } from '../hooks/useDesigner';
import { newKeyTag, pageInfo, platform } from '../hooks/usePage';
import { postWebpage, putWebpageById } from '/@/apis/gct-apaas/WebpageController';
import { postMobilePage, putMobilePageById } from '/@/apis/gct-apaas/MobilePageController';
import { useKeyParser } from '/@/hooks/develop/useKeyParser';
import { cloneDeep } from 'lodash-es';
import { useQueryStore } from '/@/store/modules/query';
import { message } from 'ant-design-vue';
import { postPadPage, putPadPageById } from '/@/apis/gct-apaas/PadPageController';
import './designer-view-info.scss';

export const DesignerViewInfo = defineComponent({
  name: 'DesignerViewInfo',
  props: {
    category: {
      type: String,
    },
  },
  setup(_, { expose }) {
    const ns = useNamespace('designer-view-info');
    const queryStore = useQueryStore();

    const { loadPageDesignHistoryList } = useDesigner();

    const addonBefore = computed(() => {
      switch (platform.value) {
        case Platform.WEB:
          return 'web_';
        case Platform.MOBILE:
          return 'mobile_';
        case Platform.PAD:
          return 'pad_';
        default:
          return '';
      }
    });

    const isLoaded = ref<boolean>(false);

    const isMobile = computed(() => platform.value === Platform.MOBILE);
    const isPad = computed(() => platform.value === Platform.PAD);

    const { keyPrefix, keySuffix, keyPad } = useKeyParser(addonBefore);

    const formRef = ref<any>(null);

    const isChanged = ref<boolean>(false);

    const isNewPage = computed(() => pageInfo.value.id === newKeyTag);

    const formData = ref<IObject>({
      categoryId: pageInfo.value.categoryId || pageInfo.value.categoryResponse?.id || _.category,
      name: pageInfo.value.name,
      key: isNewPage.value ? keyPad(pageInfo.value.key!) : pageInfo.value.key,
    });

    watch(pageInfo, () => {
      formData.value.categoryId = pageInfo.value.categoryId || pageInfo.value.categoryResponse?.id;
      formData.value.name = pageInfo.value.name;
    });

    watch(formData, () => {
      pageInfo.value.name = formData.value.name;
      pageInfo.value.key = formData.value.key;
      pageInfo.value.categoryId = formData.value.categoryId;
    });

    async function loadCategoryList(): Promise<IObject[]> {
      const res = await getCategoryListComplete({
        module:
          platform.value === Platform.WEB
            ? 'web_module'
            : platform.value === Platform.MOBILE
              ? 'mobile_module'
              : 'pad_module',
      } as any);
      if (res && res.length > 0) {
        res.forEach((item: any) => {
          delete item.children;
        });
        return res;
      }
      return [];
    }

    async function loadDefaultCategory(): Promise<void> {
      const list = await loadCategoryList();
      if (list && list.length > 0) {
        formData.value.categoryId = list[0].id;
        pageInfo.value.categoryId = list[0].id;
      }
    }

    async function onInit(): Promise<void> {
      if (isNewPage.value && !_.category) {
        await loadDefaultCategory();
      }
      isLoaded.value = true;
    }

    const formModel: IEditForm = {
      type: 'edit',
      children: [
        {
          type: 'container',
          name: '',
          layout: 'grid',
          children: [
            {
              type: 'item',
              name: 'categoryId',
              label: t('sys.pageDesigner.designInfo.classification'),
              labelPosition: 'top',
              dictionary: {
                mode: 'async',
                tag: 'page_classification',
                async fetch() {
                  return loadCategoryList();
                },
              },
              editor: {
                placeholder: t('sys.inputText'),
                type: EditorType.PICKER,
              },
            },
            {
              type: 'item',
              name: 'name',
              label: t('sys.pageDesigner.pageName'),
              labelPosition: 'top',
              rules: [
                {
                  required: true,
                  validator(_rule, value) {
                    return new Promise((resolve, reject) => {
                      if (!value) {
                        reject(t('sys.pageDesigner.designInfo.PleaseEnterThePageName'));
                      } else if (value.length > 100) {
                        reject(t('sys.max100words'));
                      } else {
                        resolve();
                      }
                    });
                  },
                },
              ],
              editor: {
                placeholder: t('sys.inputText'),
                type: EditorType.TEXT,
                props: {
                  allowClear: true,
                },
              },
            },
            {
              type: 'item',
              name: 'key',
              label: t('sys.pageDesigner.pageKey'),
              labelPosition: 'top',
              rules: [
                {
                  required: true,
                  validator(_rule, value: string) {
                    return new Promise((resolve, reject) => {
                      const val = value.substring(
                        keyPrefix.value.length,
                        value.length - keySuffix.value.length,
                      );
                      if (!value) {
                        reject(t('sys.pageDesigner.designInfo.PleaseEnterThePageKey'));
                      } else if (val.length > 100) {
                        reject(t('sys.max100words'));
                      } else {
                        if (!/^[a-zA-Z_]{1,}$/.test(val)) {
                          const text = isMobile.value
                            ? t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                                sth: `Mobile${t('sys.page')}`,
                              })
                            : isPad.value
                              ? t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                                  sth: `PAD${t('sys.page')}`,
                                })
                              : t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                                  sth: `Web${t('sys.page')}`,
                                });
                          reject(text);
                        } else {
                          resolve();
                        }
                      }
                    });
                  },
                },
              ],
              editor: {
                placeholder: t('sys.inputText'),
                type: EditorType.TEXT,
                addonBefore: keyPrefix.value,
                addonAfter: keySuffix.value,
                disabled: pageInfo.value.id !== newKeyTag,
              } as ITextEditor,
            },
          ] as IFormEditItem[],
        } as IFormContainer,
      ],
    };

    async function save(): Promise<boolean> {
      if (isChanged.value) {
        const pid = queryStore.getPid()!;
        const bol = await formRef.value.c.validate();
        if (bol === false) {
          return false;
        }
        if (!pageInfo.value.categoryId) {
          pageInfo.value.categoryId = pageInfo.value.categoryResponse?.id;
        }
        pageInfo.value.name = formData.value.name;
        pageInfo.value.key = formData.value.key;
        if (pageInfo.value.id === newKeyTag) {
          // pageInfo.value.id = '';
          if (platform.value === Platform.WEB) {
            pageInfo.value.id = await postWebpage(cloneDeep(pageInfo.value));
          } else if (platform.value === Platform.PAD) {
            // PAD端
            pageInfo.value.id = await postPadPage(cloneDeep(pageInfo.value));
          } else {
            pageInfo.value.id = await postMobilePage(cloneDeep(pageInfo.value));
          }
          queryStore.setPid(pageInfo.value.id!);
          await loadPageDesignHistoryList();
          // 在新建的情况下需要把 url 中的 pid 更新为新创建的 id
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              {
                type: 'IFRAME_CALLBACK',
                method: 'replaceUrl',
                args: [pid, pageInfo.value.id!],
              },
              '*',
            );
          } else {
            // 更新 url 中的 pid
            const url = new URL(window.location.href);
            url.searchParams.set('pid', pageInfo.value.id!);
            window.history.replaceState(null, '', url.href);
          }
        } else {
          if (platform.value === Platform.WEB) {
            await putWebpageById({ id: pageInfo.value.id! }, pageInfo.value);
          } else if (platform.value === Platform.PAD) {
            await putPadPageById({ id: pageInfo.value.id! }, pageInfo.value);
          } else {
            await putMobilePageById({ id: pageInfo.value.id! }, pageInfo.value);
          }
        }
        isChanged.value = false;
      }
      return true;
    }

    function validate(): Promise<void> {
      return formRef.value.c.validate();
    }

    function onChange(): void {
      isChanged.value = true;
    }

    function setName(name: string): void {
      if (formData.value.name !== name) {
        formData.value.name = name;
        isChanged.value = true;
      }
    }

    function onCopyKey(): void {
      const bol = copyTextToClipboard(formData.value.key);
      if (bol) {
        message.success(t('sys.pageDesigner.copySuccess'));
      }
    }

    expose({ save, validate, setName, isChanged });

    onInit();

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('form')}>
            {isLoaded.value ? (
              <gct-edit-form
                ref={(ref) => (formRef.value = ref)}
                model={formModel}
                v-model:data={formData.value}
                onChange={onChange}
                embed
              />
            ) : null}
            {isLoaded.value && pageInfo.value.id !== newKeyTag ? (
              <span class={ns.e('key-copy')} title="拷贝" onClick={onCopyKey}>
                <i class="gct-iconfont icon-icon_copy" />
              </span>
            ) : null}
          </div>
        </div>
      );
    };
  },
});
