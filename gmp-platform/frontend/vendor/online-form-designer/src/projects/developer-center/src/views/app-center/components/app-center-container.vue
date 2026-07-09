<template>
  <div :class="`${prefixCls}-container`">
    <a-tabs
      v-model:activeKey="classifyType"
      :class="`${prefixCls}-container-tabs`"
      destroy-inactive-tab-pane
    >
      <a-tab-pane
        v-for="tab in Object.keys(AppClassifyEnum)"
        :key="AppClassifyEnum[tab]"
        :tab="Ch_AppClassify[AppClassifyEnum[tab]]"
      >
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
              <template #prefix>
                <i class="search-icon iconfont icon-sousuo"></i>
              </template>
            </a-input>
            <a-upload
              class="ml-10px"
              accept=".zip"
              :showUploadList="false"
              :beforeUpload="handleBeforeUpload"
              :customRequest="handleCustomRequest"
            >
              <a-button><DownloadOutlined />应用导入</a-button>
            </a-upload>
          </div>
          <a-spin :spinning="loading" wrapperClassName="tab-loading">
            <application-card
              :prefixCls="prefixCls"
              :cardData="pageData.list"
              :filterButton="filterButton"
              :tenantId="tenantId"
              :tabActiveKey="tabActiveKey"
              :clientType="clientType"
              :platformType="PlatformEnum.PLATFORM_DEVELOPER_CENTER"
              :pagination="pagination"
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
<script setup lang="ts" name="app-center-container">
  import { onBeforeMount, watch, ref, onUnmounted, watchPostEffect } from 'vue';
  import {
    createAppTabsMenuOptions,
    AppTabsMenuEnum,
    UserRoleReqEnum,
    transformUserRole2TabType,
    PlatformEnum,
    AppClassifyEnum,
    Ch_AppClassify,
  } from '/@/components/AppManageCmp/src/constant/interface';
  import { getDropBtnPropsConfig } from '/@/components/AppManageCmp/src/constant/config';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import { ApplicationCard, TypeDropdown, SwitchTab } from '/@/components/AppManageCmp/index';
  import { useI18n } from '/@/hooks/web/useI18n';

  import {
    getAppGetAppCountByTenantId,
    getAppTenantRoleByRolesAppsCount,
    getAppTenantApps,
    getAppTenantRoleByRolesApps,
  } from '/@/apis/gct-platform/AppController';

  import { cloneDeep } from 'lodash-es';
  import { UploadFile, message } from 'ant-design-vue';

  import type {
    ICreateAppTabsMenuOptions,
    IButtonProps,
  } from '/@/components/AppManageCmp/src/types/index.d';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();

  const { t } = useI18n();

  interface Props {
    prefixCls: string;
    /** 租户id */
    tenantId: string;
    /** 职能 应用管理员 | 普通开发者 */
    developerType?: 'APPLICATION_ADMIN' | 'ORDINARY_DEVELOPER';
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
    `${userStore?.getUserInfo?.userId}_active-key`,
    () => {
      return {
        key: '',
      };
    },
  );

  const emit = defineEmits(['upload']);

  const { emitter, EmitterEnum } = useEmitter();

  const props = defineProps<Props>();

  const tabActiveKey = ref<AppTabsMenuEnum>(
    activeKeyCache.value.key ||
      (props.developerType === 'APPLICATION_ADMIN'
        ? AppTabsMenuEnum.AllApp
        : AppTabsMenuEnum.MineCollaborate),
  );

  const classifyType = ref<AppClassifyEnum>(AppClassifyEnum.Pro);
  const clientType = ref<'Card' | 'List'>(state.value.type || 'Card');
  const loading = ref<boolean>(false);
  const keyword = ref<string>('');

  const tabs = ref<ICreateAppTabsMenuOptions[]>([]);

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
    let cloneTabs = cloneDeep(createAppTabsMenuOptions);
    /**
     * 如果是普通开发者需要过滤掉全部应用和回收站
     * 如果是应用管理员需要显示全部应用和回收站
     */
    // 如果是应用管理员
    if (props.developerType === 'APPLICATION_ADMIN') {
    } else {
      cloneTabs = cloneTabs.filter(
        (item) => ![AppTabsMenuEnum.AllApp, AppTabsMenuEnum.RecycleBin].includes(item.id),
      );
    }
    tabs.value = cloneTabs;

    // 显示数量
    await getAppCount();

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
    if ([AppTabsMenuEnum.AllApp, AppTabsMenuEnum.RecycleBin].includes(tabActiveKey.value)) {
      result = await getAppTenantApps({
        deleted: Number(tabActiveKey.value === AppTabsMenuEnum.RecycleBin),
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchKey: keyword.value,
      });
    } else {
      result = await getAppTenantRoleByRolesApps(
        {
          roles: transformUserRole2TabType(tabActiveKey.value),
        },
        {
          pageNo: pagination.value.current,
          pageSize: pagination.value.pageSize,
          searchKey: keyword.value,
        },
      );
    }

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

  /** 我创建的 or 我协作的应用数量接口  */
  const requestAppCount = (roleType: UserRoleReqEnum | string, tabType: AppTabsMenuEnum) => {
    return new Promise((resolve) => {
      getAppTenantRoleByRolesAppsCount({
        roles: roleType,
      }).then((res) => {
        resolve({
          type: tabType,
          total: res ?? 0,
        });
      });
    });
  };

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
    const apis = [
      requestAppCount(
        transformUserRole2TabType(AppTabsMenuEnum.MineCreate),
        AppTabsMenuEnum.MineCreate,
      ),
      requestAppCount(
        transformUserRole2TabType(AppTabsMenuEnum.MineCollaborate),
        AppTabsMenuEnum.MineCollaborate,
      ),
    ];
    // let cloneTabs = cloneDeep(createAppTabsMenuOptions);
    /**
     * 如果是普通开发者需要过滤掉全部应用和回收站
     * 如果是应用管理员需要显示全部应用和回收站
     */
    // 如果是应用管理员
    if (props.developerType === 'APPLICATION_ADMIN') {
      apis.push(requestAllAppCount());
    } else {
      // cloneTabs = cloneTabs.filter(
      //   (item) => ![AppTabsMenuEnum.AllApp, AppTabsMenuEnum.RecycleBin].includes(item.id),
      // );
    }
    // tabs.value = cloneTabs;
    Promise.all(apis).then((res) => {
      const totals = Object.fromEntries(
        Object.entries(res.flat()).map(([_, v]: [string, any]) => [v.type, v.total]),
      );
      tabs.value.forEach((tab) => {
        tab.total = searchTotals?.[tab.id] ?? totals[tab.id];
      });
    });
  }

  const handleChange = (event) => {
    if (keyword.value === '') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    await getAppTableData();
    const searchTotals = {
      [tabActiveKey.value]: pageData.value.list.length,
    };
    await getAppCount(keyword.value ? searchTotals : null);
  };

  const handleBeforeUpload = (file: UploadFile) => {
    console.log('file.type', file.type);
    if (file.name.endsWith('.zip')) {
      // if (file.type === 'application/zip') {
      return true;
    } else {
      message.error(`只能上传zip格式文件`);
      return false;
    }
  };

  const handleCustomRequest = async ({ file }) => {
    emit('upload', file);
  };

  defineExpose({ getAppTableData, getAppCount });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-container {
    grid-column: 1 / 4;
    height: 100%;
    overflow: hidden;
    border-radius: 2px;
    background-color: #fff;

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
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 24px;
      }

      .ant-tabs-content {
        height: 100%;
        overflow: hidden;

        .tab-content-area {
          display: flex;
          width: 100%;
          height: 100%;
          flex-direction: column;
          overflow: hidden;
        }

        .search-container {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          // width: 300px;
          .search-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            font-size: 14px;
            color: #bfbfbf;
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
