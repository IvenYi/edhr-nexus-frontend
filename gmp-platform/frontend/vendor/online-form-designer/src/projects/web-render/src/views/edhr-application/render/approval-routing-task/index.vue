<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form
        :formData="formState"
        :initData="filterInitSearchList"
        @on-query="getTableData"
      />
      <a-tabs class="flex-1" v-model:activeKey="activeTabKey">
        <a-tab-pane key="1" :tab="$t('sys.menu.todo.todo')">
          <TaskTodo ref="TaskToDoRef" :can-handle="routingTaskUsePerms.Handle" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t('sys.menu.todo.done')">
          <TaskDone ref="TaskDoneRef" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useTask } from './useTask';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TaskTodo from './todo.vue';
  import TaskDone from './done.vue';

  import { usePagePermissions } from '../../hooks/usePagePermissions';
  import SearchForm from '../../components/search-form/index.vue';

  const TaskToDoRef = ref();
  const TaskDoneRef = ref();
  const { formState, activeTabKey } = useTask();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.edhr.field.name'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'input',
      label: $t('sys.edhr.field.code'),
      id: 'code',
      model: 'code',
      maxLength: 32,
    },
    {
      type: 'userSelect',
      label: t('sys.creator'),
      id: 'approveHisCreateUserId',
      model: 'approveHisCreateUserId',
    },

    {
      type: 'dateRange',
      label: t('sys.createTime'),
      startModel: 'startTime',
      endModel: 'endTime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  ];

  const filterInitSearchList = computed(() => {
    return initSearchList
      .filter((item) => {
        if (item.show && typeof item.show === 'function') {
          return item.show(activeTabKey.value);
        }
        return true;
      })
      .map((item) => {
        if (typeof item.label === 'function') {
          return {
            ...item,
            label: item.label(activeTabKey.value),
          };
        }
        return item;
      });
  });

  const routingTaskUsePerms = usePagePermissions('approval-routing-task');

  const getTableData = () => {
    if (activeTabKey.value === '1') {
      TaskToDoRef.value.getTableData(1);
    } else if (activeTabKey.value === '2') {
      TaskDoneRef.value.getTableData(1);
    }
  };
</script>

<style lang="less" scoped>
  .ant-tabs {
    :deep(.ant-tabs-content-holder) {
      height: calc(100% - 62px);
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }

    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden !important;
      }
    }
  }
</style>
