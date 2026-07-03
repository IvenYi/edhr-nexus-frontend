<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form
        :formData="formState"
        :initData="filterInitSearchList"
        @on-query="getTableData"
      />
      <a-tabs class="flex-1" v-model:activeKey="activeTabKey">
        <a-tab-pane key="1" :tab="t('sys.menu.todo.todo')">
          <TaskTodo ref="TaskToDoRef" :can-handle="processTaskUsePerms.Handle" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.menu.todo.done')">
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
  import { FIELD_TYPE } from '@gct/runtime';
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
      label: $t('sys.pageDesigner.name'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'traceSelect',
      label: t('sys.edhr.productFamily'),
      id: 'productFamilyId',
      model: 'productFamilyId',
      fieldType: FIELD_TYPE.PRODUCT_FAMILY,
      modelKey: 'em_product_family',
      selectAttrs: {
        variant: 'select',
        placeholder: t('sys.chooseText'),
      },
    },
    {
      type: 'treeTableSelect',
      label: t('sys.edhr.product'),
      id: 'productId',
      model: 'productId',
      modelKey: 'em_product',
    },
    {
      type: 'select',
      label: t('sys.edhr.field.productionMode'),
      id: 'productProcessProductionType',
      model: 'productProcessProductionType',
      options: [
        {
          label: t('sys.edhr.field.standard'),
          value: 'standard',
        },
        {
          label: t('sys.edhr.field.rework'),
          value: 'rework',
        },
        {
          label: t('sys.edhr.field.overwrite'),
          value: 'reform',
        },
      ],
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

  const processTaskUsePerms = usePagePermissions('approval-product-process-task');

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
