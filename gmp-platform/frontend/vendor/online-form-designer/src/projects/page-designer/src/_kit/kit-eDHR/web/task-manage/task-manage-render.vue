<template>
  <div class="task-manage-render bg-white" :style="widgetStyle">
    <app-dynamic-tabs
      v-model:active-key="activeKey"
      :config-id="tabsConfigId"
      :default-config="userId_tab_task"
      :beforeRequest="tabsBeforeRequest"
      :count-request="countRequest"
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
            @refresh-tabs="AppDynamicTabsRef?.refreshTabs()"
          />
        </div>
      </template>

      <template #rightExtra>
        <div class="tabs-right-extra">
          <span>
            <i class="iconfont icon-dayinanniu mr-2 cursor-pointer"></i>
            {{ $t('sys.edhr.printTemplate') }}
          </span>
          <span class="ml-6">
            <i class="iconfont icon-shouquanjilu mr-2 cursor-pointer"></i>
            {{ $t('sys.edhr.operationLog') }}
          </span>
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

<script setup lang="ts" name="gct-eDHR-task-manage-render">
  import { ref, reactive, computed } from 'vue';
  import SearchPanel from '../components/search-panel.vue';
  import DataTable from './data-table/data-table.vue';
  import QueryDefinition from '../components/query-definition.vue';
  import { ITaskManage } from './schema';
  import { QUERY_DEFINITION_DATA } from '../components/queryDefinition';
  import { useUserStore } from '/@/store/modules/user';
  import { AppDynamicTabs } from '@/components/AppDynamicTabs';
  import dayjs from 'dayjs';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SERVICE_INVOKER } from '/@/utils/service';

  const Event = getPageEvent();

  Event.context.$push('web_kfrJwhuw_jhwd', {
    containerId: rowValue.f_id__jhwd,
    _item: JSON.stringify(rowValue),
  });

  const props = defineProps<{
    widget: ITaskManage;
  }>();

  const { userId_tab_task } = QUERY_DEFINITION_DATA;
  const userInfoStore = useUserStore();

  const activeKey = ref();
  const queryDefinitionRef = ref();
  const dataTableRefs = reactive({});
  const AppDynamicTabsRef = ref();

  const tabsConfigId = computed(() => {
    const userId = userInfoStore.userInfo.userId;
    return `${userId}_tab_task`;
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
  async function countRequest(config) {
    // 临时查询视图的接口

    const res = await SERVICE_INVOKER.list(
      {
        bsKey: 'listByPage',
        modelKey: 'vm_container_task_jhwd',
        modelCategory: 'view',
      },
      {
        query: config.query,
        pageNo: 1,
        pageSize: 9999,
      },
    );
    return res.totalCount;
  }
</script>

<style lang="less" scoped>
  .task-manage-render {
    .tabs-right-extra {
      display: flex;
      align-items: center;

      &::before {
        content: '';
        display: inline-block;
        width: 1px;
        height: 20px;
        margin-right: 20px;
        background-color: #e8ebf0;
      }

      span {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }
  }
</style>
