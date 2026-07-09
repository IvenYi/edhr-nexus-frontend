<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form
        :formData="formState"
        :initData="filterInitSearchList"
        @on-query="getTableData"
      />
      <a-tabs class="flex-1" v-model:activeKey="activeTabKey">
        <a-tab-pane key="1" :tab="$t('sys.menu.myTodo')">
          <TaskTodo ref="TaskToDoRef" :can-handle="formTaskUsePerms.Handle" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t('sys.menu.myDone')">
          <TaskDone ref="TaskDoneRef" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useDocumentTask } from './useDocumentTask';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TaskTodo from './todo.vue';
  import TaskDone from './done.vue';

  import { usePagePermissions } from '../../hooks/usePagePermissions';
  import SearchForm from '../../components/search-form/index.vue';
  import {
    useInstanceStatus,
    useMaterialStatus,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import { FIELD_TYPE } from '@gct/runtime';

  const TaskToDoRef = ref();
  const TaskDoneRef = ref();
  const { formState, activeTabKey } = useDocumentTask();
  const { t } = useI18n();

  const { getStatusOptions } = useMaterialStatus();
  const { getInstanceOptions } = useInstanceStatus();

  const initSearchList = [
    // {
    //   type: 'select',
    //   label: '记录类型',
    //   id: 'materialStatus',
    //   model: 'materialStatus',
    //   options: getStatusOptions(),
    // },
    {
      type: 'input',
      label: $t('sys.edhr.serialNo'),
      id: 'serialNo',
      model: 'serialNo',
      maxLength: 32,
    },
    {
      type: 'input',
      label: $t('sys.edhr.no'),
      id: 'ofCode',
      model: 'ofCode',
      maxLength: 32,
    },
    {
      type: 'input',
      label: $t('sys.pageDesigner.name'),
      id: 'ofTmplName',
      model: 'ofTmplName',
      maxLength: 32,
    },
    {
      type: 'lotTableSelect',
      label: $t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      selectAttrs: {
        variant: 'select',
        placeholder: $t('sys.chooseText'),
      },
    },
    {
      type: 'traceSelect',
      label: $t('sys.edhr.field.mfgOrder'),
      id: 'mfgOrderId',
      model: 'mfgOrderId',
      modelKey: 'em_mfg_order',
      fieldType: FIELD_TYPE.MFG_ORDER,
      selectAttrs: {
        variant: 'select',
        placeholder: $t('sys.chooseText'),
      },
    },
    {
      type: 'treeTableSelect',
      label: $t('sys.edhr.product'),
      id: 'productId',
      model: 'productId',
      modelKey: 'em_product',
      parentToDefault: true,
      hideSingleVersion: false,
    },
    {
      type: 'input',
      label: $t('sys.onlineForm.remarkName'),
      id: 'title',
      model: 'title',
      maxLength: 32,
    },
    {
      type: 'userSelect',
      label: $t('sys.creator'),
      id: 'ofCreateUserId',
      model: 'ofCreateUserId',
    },

    {
      type: 'dateRange',
      label: $t('sys.createTime'),
      startModel: 'startTime',
      endModel: 'endTime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    // {
    //   type: 'userSelect',
    //   label: t('sys.updatePerson'),
    //   id: 'ofModifyUserId',
    //   model: 'ofModifyUserId',
    //   show: (tab) => tab === '1',
    // },
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

  const formTaskUsePerms = usePagePermissions('document-task');

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
