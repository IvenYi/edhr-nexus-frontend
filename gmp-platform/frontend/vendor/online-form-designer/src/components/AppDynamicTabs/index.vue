<template>
  <div class="app-dynamic-tabs">
    <a-spin :indicator="indicator" :spinning="spinning" />
    <a-tabs
      v-model:activeKey="_activeKey"
      ref="tabsRef"
      type="editable-card"
      @edit="handleTabsEdit"
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
              <!-- <span v-if="tab.showCount" class="ml-2">{{  }}</span> -->
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

          <slot name="tabContent" :tab="tab"></slot>
        </a-tab-pane>
      </template>

      <template #rightExtra>
        <slot name="rightExtra"></slot>
      </template>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { IconNext } from '/@/components/Icon';
  import { getSysConfigInfo, postSysConfig } from '/@/apis/gct-apaas/SysConfigController';
  import { useAppDynamicTabs } from '@/components/AppDynamicTabs';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { cloneDeep } from 'lodash-es';

  const Event = getPageEvent();

  const props = defineProps<{
    activeKey?: string;
    configId?: string;
    defaultConfig?: any;
    modelKey?: string;
    beforeRequest?: Function;
    countRequest?: (config) => number;
  }>();

  const { configValueMap, setTableTotalCount } = useAppDynamicTabs();

  const emit = defineEmits(['update:activeKey', 'edit']);

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

  function handleTabsEdit(...args) {
    emit('edit', ...args);
  }

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
    const firstVisibleTab = tabList.value.find((tab) => tab.checked);
    _activeKey.value = firstVisibleTab?.id;
    spinning.value = false;
    getAllTabsCount();
  });

  onBeforeUnmount(() => {
    // Object.keys(dataTableRefs).forEach((key) => {
    //   delete dataTableRefs[key];
    // });
  });
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

  const getTabCount = async (id, queryConf?) => {
    let config = queryConf;
    if (props.beforeRequest) {
      config = props.beforeRequest(cloneDeep(queryConf));
    }

    // 查询count接口获取数值
    let countNum: number | undefined = undefined;
    if (props.countRequest) {
      countNum = await props.countRequest(config);
    } else if (props.modelKey) {
      // 默认实体模型的查询count接口
      countNum = await Event.context.$request(props.modelKey, 'count', {
        query: {},
        body: {
          query: config.query,
        },
      });
    }
    if (countNum !== undefined) {
      setTableTotalCount(`${props.configId}.${id}`, countNum);
    }
  };

  const getAllTabsCount = () => {
    tabList.value.forEach((e) => {
      console.log('all', e);
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
