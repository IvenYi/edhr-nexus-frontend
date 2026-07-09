<template>
  <div :class="`${prefixCls}-container`">
    <div class="application-content">
      <div class="tab-content-area">
        <div class="search-container">
          <a-input
            class="important-w-260px"
            :placeholder="t('sys.developer.appCenter.searchPlaceholder')"
            allowClear
            v-model:value="keyword"
            @press-enter="handleSearch"
            @change="handleChange"
          >
            <template #suffix>
              <i class="search-icon iconfont icon-sousuo" style="color: #212528"></i>
            </template>
          </a-input>

          <div class="right-extra-area">
            <switch-tab class="ml-8px mr-16px" v-model:showType="clientType" />
            <a-button type="primary" @click="$emit('create-app', appActiveKey)">
              <template #icon>
                <PlusOutlined />
              </template>
              {{ t('sys.developer.appCenter.createApp') }}
            </a-button>
          </div>
        </div>

        <a-spin :spinning="loading" wrapperClassName="tab-loading">
          <application-card
            :prefixCls="prefixCls2"
            :cardData="pageData.list"
            :filterButton="filterButton"
            :tenantId="tenantId"
            :tabActiveKey="tabActiveKey"
            :appActiveKey="appActiveKey"
            :clientType="clientType"
            :platformType="PlatformEnum.PLATFORM_DEVELOPER_CENTER"
            :pagination="pagination"
            :isOnlyBI="true"
            @on-request-data="getAppTableData"
            @on-request-total="getAppCount"
          >
            <template #pageMore>
              <div
                v-show="pageData.hasMorePage && clientType === 'Card'"
                :class="`${tabActiveKey}-loading request-loading`"
              >
                加载中...
              </div>
            </template>
          </application-card>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="bi-app-center-container">
  import { onBeforeMount, watch, ref, onUnmounted, watchPostEffect } from 'vue';
  import {
    AppTabsMenuEnum,
    PlatformEnum,
    AppClassifyEnum,
  } from '/@/components/AppManageCmp/src/constant/interface';
  import { getDropBtnPropsConfig } from '/@/components/AppManageCmp/src/constant/config';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { IButtonProps } from '/@/components/AppManageCmp/src/types/index.d';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';
  import { getAppTenantApps } from '/@/apis/gct-platform/AppController';
  import { ApplicationCard, SwitchTab } from '/@/components/AppManageCmp/index';
  import { useDesign } from '/@/hooks/web/useDesign';

  const userStore = useUserStore();
  const { t } = useI18n();
  const { prefixCls: prefixCls2 } = useDesign('application-manage-cmp');

  interface Props {
    prefixCls: string;
    /** 租户id */
    tenantId: string;
    /** 职能 应用管理员 | 普通开发者 */
    developerType?: 'APPLICATION_ADMIN' | 'ORDINARY_DEVELOPER';
    /** BI是否有权限 */
    hasBILicense: boolean;
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

  const props = defineProps<Props>();

  const tabActiveKey = ref<AppTabsMenuEnum>(
    props.developerType === 'APPLICATION_ADMIN'
      ? AppTabsMenuEnum.AllApp
      : AppTabsMenuEnum.MineCollaborate,
  );

  const emit = defineEmits(['create-app']);
  const { emitter, EmitterEnum } = useEmitter();

  const clientType = ref<'Card' | 'List'>(state.value.type || 'Card');
  const loading = ref<boolean>(false);
  const keyword = ref<string>('');
  const appActiveKey = ref<AppClassifyEnum>(AppClassifyEnum.Bi);
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

  onBeforeMount(async () => {
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
    [tabActiveKey, clientType],
    async ([tabType, _clientType]) => {
      pageData.value.list = [];
      pageData.value.hasMorePage = false;
      pagination.value.current = 1;
      pagination.value.pageSize = 20;
      pagination.value.total = 0;
      await getAppTableData();
      filterButton.value = getDropBtnPropsConfig({ tabType: tabType });
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
    const dom = document.querySelector(`.${tabActiveKey.value}-loading`);
    if (dom) {
      observer.observe(dom);
    }
  });

  onUnmounted(() => {
    observer.disconnect();
  });

  async function requestApi(isMore = false) {
    const result: any =
      (await getAppTenantApps({
        deleted: 0,
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchKey: keyword.value,
        type: appActiveKey.value,
      })) || {};

    pagination.value.total = result.totalCount;
    if (isMore) {
      pageData.value.list = pageData.value.list.concat(result?.data ?? []);
    } else {
      pageData.value.list = result?.data ?? [];
    }
    pageData.value.hasMorePage = result?.totalPage > result?.pageNo || false;
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

  function getAppCount() {}

  const handleChange = () => {
    if (keyword.value === '') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    await getAppTableData();
  };

  defineExpose({ getAppTableData });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-bi-app-manage-cmp';

  .@{prefix-cls}-container {
    grid-column: 1 / 4;
    overflow: hidden;
    border-radius: 2px;

    .title {
      font-size: 22px;
      font-weight: 500;
    }

    .application-title {
      z-index: 98;
      width: calc(100vw - 275px);
      background-color: #fff;
    }

    .right-extra-area {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
    }

    .request-loading {
      padding-bottom: 10px;
      color: #333;
      line-height: 22px;
      text-align: center;
    }
  }

  .application-content {
    width: 100%;
    height: 100%;

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
      justify-content: space-between;
      width: calc(100% - 40px);
      padding: 12px 20px;
      margin: 0 20px;
      background: #fff;
      box-shadow: 0 0 3px #bfbfbf;
      border-top: 1px solid #e0e0e0;
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
  }
  // }
</style>
