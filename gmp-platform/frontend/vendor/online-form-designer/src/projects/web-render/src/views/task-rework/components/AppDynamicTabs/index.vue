<template>
  <div class="app-dynamic-tabs">
    <a-spin :indicator="indicator" :spinning="spinning" />
    <a-tabs
      v-model:activeKey="_activeKey"
      ref="tabsRef"
      type="editable-card"
      @edit="handleTabsEdit"
      @tabClick="handleTabClick"
    >
      <template v-for="tab in tabList" :key="tab.id">
        <a-tab-pane :key="tab.id" :closable="false" :forceRender="false" v-if="tab.checked">
          <template #tab>
            <span class="flex items-center">
              <IconNext
                v-if="tab.icon"
                :value="tab.icon"
                :size="16"
                :color="tab.color ?? 'var(--ant-primary-color)'"
                class="mr-2"
              />
              {{ tab.name }}
              <span
                class="ml-2"
                v-if="
                  configValueMap[`${configId}.${tab.id}`]?.tableTotalCount ||
                  configValueMap[`${configId}.${tab.id}`]?.tableTotalCount === 0
                "
                >{{ configValueMap[`${configId}.${tab.id}`]?.tableTotalCount ?? 0 }}</span
              >
            </span>
          </template>

          <slot name="tabContent" :tab="{ ...tab, query: formatQuery(tab) }"></slot>
        </a-tab-pane>
      </template>

      <template #rightExtra>
        <slot name="rightExtra"></slot>
      </template>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, h } from 'vue';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { IconNext } from '/@/components/Icon';
  import { getSysConfigInfo, postSysConfig } from '/@/apis/gct-apaas/SysConfigController';
  import { useAppDynamicTabs } from '@/components/AppDynamicTabs';
  import { cloneDeep, isEqual } from 'lodash-es';
  import TabsModal from './tabs-modal.vue';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    activeKey?: string;
    configId?: string;
    defaultConfig?: any;
    modelKey?: string;
    beforeRequest?: Function;
  }>();

  const { configValueMap, setTableTotalCount } = useAppDynamicTabs();

  const emit = defineEmits(['update:activeKey', 'refresh', 'tab-click']);

  const _activeKey = computed({
    get() {
      return props.activeKey;
    },
    set(v) {
      emit('update:activeKey', v);
    },
  });

  const tabList = ref<any[]>([]);
  const spinning = ref(false);
  const indicator = h(LoadingOutlined, {
    style: {
      fontSize: '24px',
    },
    spin: true,
  });

  onMounted(async () => {
    spinning.value = true;
    if (props.configId) {
      const configRes = await getSysConfigInfo({ key: props.configId });
      if (configRes === null) {
        await postSysConfig({
          id: props.configId,
          value: JSON.stringify(props.defaultConfig),
        });
      } else {
        tabList.value = JSON.parse(configRes?.value as string) ?? props.defaultConfig;
      }
    } else {
      tabList.value = props.defaultConfig;
    }
    getAllTabsCount();
    const firstVisibleTab = tabList.value.find((tab) => tab.checked);
    _activeKey.value = firstVisibleTab?.id;
    spinning.value = false;
  });

  async function handleTabsEdit() {
    const res = await gct.openUtil.drawer(
      TabsModal,
      {
        configId: props.configId,
      },
      {
        title: '添加',
      },
    );
    if (res.ok) {
      const refreshTabs = res.data?.filter((e) => {
        return !tabList.value.find((f) => isEqual(e, f));
      });
      tabList.value = res?.data || [];
      if (!res.data.some((e) => _activeKey.value === e.id)) {
        _activeKey.value = res.data[0].id;
      }
      getAllTabsCount(refreshTabs);
      emit('refresh', res?.data);
    }
  }

  function handleTabClick(tab) {
    emit(
      'tab-click',
      tabList.value.find((e) => e.id === tab),
    );
  }

  async function handleUpdatedQuery(data) {
    const configRes = await getSysConfigInfo({ key: props.configId });
    tabList.value = JSON.parse(configRes?.value as string) ?? data;
    const isActiveTabByHide = tabList.value.every(
      (tab) => tab.id !== _activeKey.value && tab.checked,
    );
    if (isActiveTabByHide) {
      const firstVisibleTab = tabList.value.find((tab) => tab.checked);
      _activeKey.value = firstVisibleTab?.id;
    }
  }

  const formatQuery = (config) => {
    const { queryOperators } = config;
    let query = cloneDeep(config.query);
    // 处理查询条件中字典项和操作项
    Object.keys(query).forEach((key) => {
      if (query[key] && Object.hasOwn(queryOperators, key)) {
        query[`${key}.${queryOperators[key]}`] = query[key];
        delete query[key];
      }
    });
    return query;
  };

  const getTabCount = async (id, queryConf?) => {
    // const { queryOperators } = queryConf;
    // let query = cloneDeep(queryConf.query);
    // // 处理查询条件中字典项和操作项
    // Object.keys(query).forEach((key) => {
    //   if (query[key] && Object.hasOwn(queryOperators, key)) {
    //     query[`${key}.${queryOperators[key]}`] = query[key];
    //     delete query[key];
    //   }
    // });
    let query = formatQuery(queryConf);
    if (props.beforeRequest) {
      query = props.beforeRequest(query);
    }
    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'count',
        modelKey: props.modelKey!,
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        query: { ...query, reworked_: 1 },
      },
    );
    setTableTotalCount(`${props.configId}.${id}`, res);
  };

  const getAllTabsCount = (tabs = tabList.value) => {
    tabs.forEach((e) => {
      getTabCount(e.id, e);
    });
  };

  defineExpose({
    update: handleUpdatedQuery,
    refreshTabs: () => getAllTabsCount(),
  });
</script>

<style lang="less" scoped>
  .app-dynamic-tabs {
    :deep(.ant-tabs-nav-list) {
      align-items: center;
    }
    :deep(.ant-tabs-tab) {
      background-color: #ffffff;
      border: none !important;
      border-bottom: 1px solid #e8ebf0 !important;
      padding: 12px 16px;
    }
    :deep(.ant-tabs-tab-active) {
      border-bottom: 2px solid var(--ant-primary-color) !important;
    }
    :deep(.ant-tabs-nav-add),
    :deep(.ant-tabs-nav-operations .ant-tabs-nav-add) {
      background-color: var(--ant-primary-1);
      color: var(--ant-primary-color);
      line-height: 24px;
      height: 24px;
      min-width: 24px;
      padding: 0 4px;
      margin-left: 20px;
      margin-right: 20px;
      border: none;
      outline: none;
      align-self: center;
    }
  }
</style>
