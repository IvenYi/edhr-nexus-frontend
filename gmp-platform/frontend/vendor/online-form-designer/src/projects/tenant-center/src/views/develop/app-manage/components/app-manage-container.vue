<template>
  <div :class="`${prefixCls}-container`">
    <a-tabs
      v-model:activeKey="classifyType"
      :class="`${prefixCls}-container-tabs`"
      destroy-inactive-tab-pane
    >
      <a-tab-pane
        v-for="tab in Object.keys(tabsList)"
        :key="AppClassifyEnum[tab]"
        :tab="Ch_AppClassify[AppClassifyEnum[tab]]"
      >
        <div class="tab-content-area">
          <div class="search-container">
            <a-input
              :placeholder="t('sys.developer.appCenter.searchPlaceholder')"
              allowClear
              v-model:value="keyword"
              @press-enter="handleSearch"
            >
              <template #prefix>
                <i class="search-icon iconfont icon-sousuo"></i>
              </template>
            </a-input>
          </div>
          <a-spin :spinning="loading" wrapperClassName="tab-loading">
            <application-card
              :prefixCls="prefixCls"
              :cardData="pageData.list"
              :filterButton="filterButton"
              :tenantId="tenantId"
              :tabActiveKey="tabActiveKey"
              :clientType="clientType"
              :platformType="PlatformEnum.PLATFORM_TENANT_CENTER"
              :pagination="pagination"
              :classifyType="classifyType"
              @on-request-data="getAppTableData"
              @on-request-total="getAppCount"
            >
              <template #pageMore>
                <div
                  v-show="pageData.hasMorePage && clientType === 'Card'"
                  :class="`${AppClassifyEnum[tab]}-loading request-loading`"
                >
                  {{ t('sys.loadingText') }}
                </div>
              </template>
            </application-card>
          </a-spin>
        </div>
      </a-tab-pane>

      <template #rightExtra>
        <div class="right-extra-area">
          <type-dropdown
            :isTenant="true"
            :options="tabs"
            v-model:activeKey="tabActiveKey"
            v-if="classifyType === AppClassifyEnum.Pro"
          />
          <switch-tab class="ml-8px" v-model:showType="clientType" />
        </div>
      </template>
    </a-tabs>
  </div>
</template>
<script setup lang="ts" name="app-manage-container">
  import { onBeforeMount, watch, ref, reactive, onUnmounted, watchPostEffect, computed } from 'vue';
  import {
    createAppTabsMenuOptions,
    AppTabsMenuEnum,
    AppClassifyEnum,
    Ch_AppClassify,
    PlatformEnum,
  } from '/@/components/AppManageCmp/src/constant/interface';
  import { getDropBtnPropsConfig } from '/@/components/AppManageCmp/src/constant/config';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import { ApplicationCard, TypeDropdown, SwitchTab } from '/@/components/AppManageCmp/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getAppGetAppCountByTenantId,
    getAppPageList,
    getAppTenantApps,
  } from '/@/apis/gct-platform/AppController';

  import { cloneDeep, isEmpty } from 'lodash-es';

  import type { FormInstance } from 'ant-design-vue';
  import type {
    ICreateAppTabsMenuOptions,
    IButtonProps,
  } from '/@/components/AppManageCmp/src/types/index.d';

  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';

  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();

  interface Props {
    prefixCls: string;
    /** 租户id */
    tenantId: string;
  }

  interface IPageData {
    list: Array<AppResponse>;
    hasMorePage: boolean;
  }

  const state = useStorage<{ [key: string]: any }>(
    `${userStore?.getUserInfo?.userId}_switch-tab`,
    () => {
      return {
        type: '',
      };
    },
  );

  const activeKeyCache = useStorage<{ [key: string]: any }>(
    `${userStore?.getUserInfo?.userId}_tenant_active-key`,
    () => {
      return {
        key: '',
      };
    },
  );

  const { emitter, EmitterEnum } = useEmitter();

  const { t } = useI18n();

  const props = defineProps<Props>();

  const hasBILicense = ref(false);

  const tabActiveKey = ref<AppTabsMenuEnum>(activeKeyCache.value.key || AppTabsMenuEnum.AllApp);
  const classifyType = ref<AppClassifyEnum>(AppClassifyEnum.Pro);
  const clientType = ref<'Card' | 'List'>(state.value.type || 'Card');
  const loading = ref<boolean>(false);
  const keyword = ref<string>('');

  const tabs = ref<ICreateAppTabsMenuOptions[]>(
    cloneDeep(createAppTabsMenuOptions).filter((item) =>
      [AppTabsMenuEnum.AllApp, AppTabsMenuEnum.RecycleBin].includes(item.id),
    ),
  );

  const formRef = ref<FormInstance>();

  const filterButton = ref<IButtonProps[]>([]);

  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showQuickJumper: false,
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const pageData = ref<IPageData>({
    list: [],
    hasMorePage: false,
  });

  let observer;

  const tabsList = computed(() => {
    return hasBILicense.value
      ? AppClassifyEnum
      : {
          /** 专业应用 */
          Pro: 'PRO',
          /** 微应用 */
          Micro: 'MICRO',
        };
  });

  onBeforeMount(async () => {
    // 显示数量
    await getAppCount();

    getBILicense();

    emitter.on(EmitterEnum.on_refresh_app_list, () => getAppTableData());

    emitter.on(EmitterEnum.on_change_pagination, async (paginationInfo: any) => {
      const { current, total, pageSize } = paginationInfo;
      pagination.value.current = current;
      pagination.value.total = total;
      pagination.value.pageSize = pageSize;
      requestApi();
    });
  });

  watch(
    [tabActiveKey, classifyType, clientType],
    async ([tabType, _classifyType, _clientType]) => {
      pageData.value.list = [];
      pageData.value.hasMorePage = false;
      pagination.value.current = 1;
      pagination.value.pageSize = 20;
      pagination.value.total = 0;
      if (_classifyType === AppClassifyEnum.Pro) {
        await getAppTableData();
        await getAppCount();
        filterButton.value = getDropBtnPropsConfig({ tabType: tabType });
      } else if (_classifyType === AppClassifyEnum.Bi) {
        await getAppTableData();
        await getAppCount();
        filterButton.value = getDropBtnPropsConfig({ tabType: tabType });
      }
    },
    { immediate: true },
  );

  watchPostEffect(() => {
    observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        // 如果不可见，就返回
        if (!entry.isIntersecting && entries[0].intersectionRatio <= 0) return;
        // 加载数据
        console.log('到底了，要加载数据了哦', pageData.value.hasMorePage);
        pageData.value.hasMorePage && (await getAppTableData(true));
      });
    });
    const dom = document.querySelector(`.${classifyType.value}-loading`);
    if (dom) {
      observer.observe(dom);
    }
  });

  onUnmounted(() => {
    observer.disconnect();
  });

  async function requestApi(isMore = false) {
    let result;
    if (classifyType.value === AppClassifyEnum.Pro) {
      result = await getAppPageList({
        tenantId: props.tenantId,
        deleted: Number(tabActiveKey.value === AppTabsMenuEnum.RecycleBin),
        // id: !isEmpty(formState.id) ? formState.id : undefined,
        // name: !isEmpty(formState.name) ? formState.name : undefined,
        searchKey: keyword.value,
        type: classifyType.value,
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
      });
    } else if (classifyType.value === AppClassifyEnum.Bi) {
      result = await getAppTenantApps({
        pageNo: 1,
        pageSize: 99999,
        deleted: 0,
        searchKey: keyword.value,
        type: classifyType.value,
      });
    }
    console.log('result', result);
    if (result) {
      pagination.value.total = result?.totalCount || 0;
      if (isMore) {
        pageData.value.list = pageData.value.list.concat(result?.data ?? []);
      } else {
        pageData.value.list = result?.data ?? [];
      }
      pageData.value.hasMorePage = result?.totalPage > result?.pageNo || false;
    }
  }

  async function getAppTableData(isMore = false) {
    loading.value = true;
    if (isMore) {
      pagination.value.current = pagination.value.current + 1;
    } else {
      pagination.value.current = 1;
    }

    await requestApi(isMore);
    loading.value = false;
  }

  /** 全部应用 or 回收站应用数量接口  */
  const requestAllAppCount = () => {
    return new Promise((resolve) => {
      getAppGetAppCountByTenantId({ tenantId: props.tenantId }).then((res) => {
        resolve([
          {
            type: AppTabsMenuEnum.AllApp,
            total: res?.allCount ?? 0,
          },
          {
            type: AppTabsMenuEnum.RecycleBin,
            total: res?.recycleBinCount ?? 0,
          },
        ]);
      });
    });
  };

  async function getAppCount(searchTotals?) {
    // tabs.value = cloneDeep(createAppTabsMenuOptions).filter((item) =>
    //   [AppTabsMenuEnum.AllApp, AppTabsMenuEnum.RecycleBin].includes(item.id),
    // );
    requestAllAppCount().then((res: any) => {
      const totals = Object.fromEntries(
        Object.entries(res).map(([_, v]: [string, any]) => [v.type, v.total]),
      );
      tabs.value.forEach((tab) => {
        tab.total = searchTotals?.[tab.id] ?? totals[tab.id];
      });
    });
  }

  const handleSearch = async () => {
    await getAppTableData();
    const searchTotals = {
      [tabActiveKey.value]: pageData.value.list.length,
    };
    await getAppCount(keyword.value ? searchTotals : null);
  };

  /** 获取BI是否有授权 */
  const getBILicense = () => {
    getLicenseModuleAuth().then((res) => {
      hasBILicense.value = res;
    });
  };

  defineExpose({ getAppTableData });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-radius: 2px;
    background-color: #fff;

    .card-query {
      padding: 20px 16px 0 20px;
    }

    &-tabs {
      height: 100%;
      overflow: hidden;

      .ant-tabs-nav {
        margin-bottom: 0;

        .ant-tabs-nav-wrap {
          .ant-tabs-tab {
            margin-left: 20px;

            & + .ant-tabs-tab {
              margin-left: 28px;
            }
          }
        }
      }

      .right-extra-area {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        padding-right: 24px;
      }

      .ant-tabs-content {
        height: 100%;
        overflow: hidden;

        .tab-content-area {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .search-container {
          display: flex;
          align-items: center;
          width: 300px;
          padding: 12px 20px;

          .search-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            color: #bfbfbf;
            font-size: 14px;
          }
        }

        .tab-loading {
          width: 100%;
          height: 100%;
          overflow: hidden;

          .ant-spin-container {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
        }
      }

      .request-loading {
        padding-bottom: 10px;
        color: #333;
        line-height: 22px;
        text-align: center;
      }
    }
  }
</style>
