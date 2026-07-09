<template>
  <div class="p-16px flex flex-col h-full">
    <search-form :formData="formState" :initData="initSearchList" @on-query="getTableData" />
    <TaskTodo ref="TaskToDoRef" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useDocumentTask } from '../useDocumentTask';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TaskTodo from './todo.vue';

  import { useMaterialStatus } from '/@online-form/views/integration/apaas_ebr/index';
  import SearchForm from '/@web-render/views/edhr-application/components/search-form/index.vue';

  import { FIELD_TYPE } from '@gct/runtime';

  const TaskToDoRef = ref();
  const { formState } = useDocumentTask();
  const { t } = useI18n();

  const { getStatusOptions } = useMaterialStatus();

  const initSearchList = [
    {
      type: 'input',
      label: '流水号',
      id: 'serialNo',
      model: 'serialNo',
      maxLength: 32,
    },
    {
      type: 'input',
      label: $t('sys.onlineForm.remarkName'),
      id: 'title',
      model: 'title',
      maxLength: 32,
    },
    {
      type: 'input',
      label: '名称',
      id: 'ofTmplName',
      model: 'ofTmplName',
      maxLength: 32,
    },
    {
      type: 'lotTableSelect',
      label: t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      selectAttrs: {
        variant: 'select',
        placeholder: '请选择',
      },
    },
    {
      type: 'traceSelect',
      label: '工单编号',
      id: 'mfgOrderId',
      model: 'mfgOrderId',
      modelKey: 'em_mfg_order',
      fieldType: FIELD_TYPE.MFG_ORDER,
      selectAttrs: {
        variant: 'select',
        placeholder: '请选择',
      },
    },
    {
      type: 'treeTableSelect',
      label: '产品',
      id: 'productId',
      model: 'productId',
      modelKey: 'em_product',
      parentToDefault: true,
      hideSingleVersion: false,
    },
    {
      type: 'userSelect',
      label: t('sys.creator'),
      id: 'ofCreateUserId',
      model: 'ofCreateUserId',
    },

    {
      type: 'dateRange',
      label: '创建时间',
      startModel: 'startTime',
      endModel: 'endTime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  ];

  const getTableData = () => {
    TaskToDoRef.value.getTableData(1);
  };
</script>

<style lang="less" scoped></style>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
