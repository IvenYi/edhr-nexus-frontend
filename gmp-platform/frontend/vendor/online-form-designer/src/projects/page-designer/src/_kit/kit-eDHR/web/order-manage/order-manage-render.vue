<template>
  <div class="order-manage-render bg-white" :style="widgetStyle">
    <app-dynamic-tabs
      v-model:active-key="activeKey"
      :config-id="tabsConfigId"
      :default-config="userId_tab_order"
      :beforeRequest="tabsBeforeRequest"
      model-key="em_mfg_order"
      @edit="handleTabsEdit"
      ref="AppDynamicTabsRef"
    >
      <template #tabContent="{ tab }">
        <div>
          <SearchPanel
            ref="searchPanelRef"
            :mode="'render'"
            :widget="props.widget"
            @search="handleSearch"
            @reset="handleReset"
          />
          <DataTable
            :data-id="`${tabsConfigId}.${tab.id}`"
            :id="`data-table-${activeKey}`"
            :ref="(el) => setDataTableRef(tab.id, el)"
            :mode="'render'"
            :widget="props.widget"
            :initial-params="tab.query"
            @refresh="AppDynamicTabsRef?.refreshTabs()"
          />
        </div>
      </template>

      <template #rightExtra>
        <div class="tabs-right-extra">
          <component :is="EXPORT_BUTTON" :widget="exportWidget" />
          <component :is="IMPORT_BUTTON" :widget="importWidget" />
          <a-button type="primary" @click="onCreateOrder">
            <template #icon>
              <icon-next value="icon-platform:platform-xinjian" :size="16" class="mr4px" />
            </template>
            新建
          </a-button>
        </div>
      </template>
    </app-dynamic-tabs>
  </div>

  <QueryDefinition
    ref="queryDefinitionRef"
    :configId="tabsConfigId"
    :widget="props.widget"
    :queryConfigWidgets="computedQueryFields"
    @updated="handleUpdatedQuery"
  />
</template>

<script setup lang="ts" name="gct-eDHR-order-manage-render">
  import { ref, reactive, computed, provide } from 'vue';
  import SearchPanel from '../components/search-panel.vue';
  import DataTable from './data-table/data-table.vue';
  import QueryDefinition from '../components/query-definition.vue';
  import { IOrderManage } from './schema';
  import { QUERY_DEFINITION_DATA } from '../components/queryDefinition';
  import { useUserStore } from '/@/store/modules/user';
  import { AsyncGctComponents } from '/@page-designer/components/pcModule';
  import { FormComponents } from '@gct/runtime';
  import { AppDynamicTabs } from '@/components/AppDynamicTabs';
  import dayjs from 'dayjs';

  provide('tableEvent', {
    afterImport() {
      handleSearch({});
    },
  });

  const props = defineProps<{
    widget: IOrderManage;
  }>();

  const { userId_tab_order } = QUERY_DEFINITION_DATA;
  const userInfoStore = useUserStore();
  const activeKey = ref();
  const queryDefinitionRef = ref();
  const AppDynamicTabsRef = ref();
  const dataTableRefs = reactive({});

  const IMPORT_BUTTON = computed(() =>
    AsyncGctComponents.getComponentByType(FormComponents.ImportButton),
  );
  const importWidget = computed(() => {
    return {
      id: `gc-import-button${new Date().getTime()}`,
      name: '模板导入',
      icon: 'icon-daoru',
      props: {
        ...props.widget.props,
        title: '模板导入',
        type: 'default',
        icon: 'icon-platform:platform-daoru',
        hasIcon: true,
        hasText: true,
        templateKey: props.widget.props.importTemplateKey,
      },
    };
  });

  const EXPORT_BUTTON = computed(() =>
    AsyncGctComponents.getComponentByType(FormComponents.ExportButton),
  );
  const exportWidget = computed(() => {
    return {
      id: `gc-export-button${new Date().getTime()}`,
      name: '导出',
      icon: 'icon-daochu',
      props: {
        ...props.widget.props,
        title: '导出',
        icon: 'icon-platform:platform-daochu',
        hasIcon: true,
        hasText: true,
        type: 'default',
        templateKey: props.widget.props.exportTemplateKey,
      },
    };
  });

  const tabsConfigId = computed(() => {
    const userId = userInfoStore.userInfo.userId;
    return `${userId}_tab_order`;
  });

  const widgetStyle = computed(() => {
    return {
      paddingTop: (props.widget.style.paddingTop || 0) + 'px',
      paddingBottom: (props.widget.style.paddingBottom || 0) + 'px',
      paddingLeft: (props.widget.style.paddingLeft || 0) + 'px',
      paddingRight: (props.widget.style.paddingRight || 0) + 'px',
    };
  });

  const computedQueryFields = computed(() => {
    return props.widget.children?.[4];
  });

  function setDataTableRef(tabId, el) {
    if (el) {
      dataTableRefs[tabId] = el;
    } else {
      delete dataTableRefs[tabId];
    }
  }

  function handleTabsEdit(target, action) {
    if (action === 'add') {
      queryDefinitionRef.value.onOpen();
    }
  }

  function handleSearch(params: any) {
    const dataTable = dataTableRefs[activeKey.value];
    dataTable.loadData(params);
  }

  function handleReset() {
    handleSearch({});
  }

  async function handleUpdatedQuery(data) {
    AppDynamicTabsRef.value.update(data);
  }

  function onCreateOrder() {
    const dataTable = dataTableRefs[activeKey.value];
    dataTable.onAdd();
  }

  function getTimeRange(type) {
    if (type !== 'week') {
      return {
        start: dayjs().startOf(type).format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs().endOf(type).format('YYYY-MM-DD HH:mm:ss'),
      };
    } else {
      const currentDate = dayjs();
      const day = currentDate.day();
      const subtractDays = day === 0 ? 6 : day - 1;
      const start = currentDate.subtract(subtractDays, 'day').startOf('day');
      const end = start.add(6, 'day').endOf('day');
      return {
        start: start.format('YYYY-MM-DD HH:mm:ss'),
        end: end.format('YYYY-MM-DD HH:mm:ss'),
      };
    }
  }

  function tabsBeforeRequest(config) {
    const { isDefiniteDate, definiteTimeType } = config;
    if (isDefiniteDate) {
      const { start, end } = getTimeRange(definiteTimeType);
      config.query['planned_start_date_.ge'] = start;
      config.query['planned_completion_date_.le'] = end;
      config.query['real_start_date_.ge'] = start;
      config.query['real_completion_date_.le'] = end;
    }
    return config;
  }
</script>

<style scoped lang="less">
  .order-manage-render {
    .tabs-right-extra {
      display: flex;
      align-items: center;
      gap: 8px;
      :deep(.ant-btn) {
        gap: 4px;
      }
    }
  }
</style>
