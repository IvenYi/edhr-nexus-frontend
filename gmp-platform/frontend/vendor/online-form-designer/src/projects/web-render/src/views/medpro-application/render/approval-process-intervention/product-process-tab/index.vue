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
  import { FIELD_TYPE } from '@gct/runtime';

  import SearchForm from '/@web-render/views/edhr-application/components/search-form/index.vue';

  const TaskToDoRef = ref();
  const { formState } = useDocumentTask();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: '名称',
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
        placeholder: '请选择',
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
      label: t('sys.edhr.productionType'),
      id: 'productProcessProductionType',
      model: 'productProcessProductionType',
      options: [
        {
          label: t('量产'),
          value: 'standard',
        },
        {
          label: t('返工'),
          value: 'rework',
        },
        {
          label: t('改制'),
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
