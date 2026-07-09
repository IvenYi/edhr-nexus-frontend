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

  import SearchForm from '/@web-render/views/edhr-application/components/search-form/index.vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import { MaterialStatusEnum } from '/@online-form/views/integration/apaas_ebr/index';

  const TaskToDoRef = ref();
  const { formState } = useDocumentTask();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'lotTableSelect',
      label: t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      selectAttrs: {
        ignoreArchived: false,
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
      type: 'select',
      label: '记录类型',
      id: 'materialStatus',
      model: 'materialStatus',
      options: getTypeOptions(),
    },
    {
      type: 'userSelect',
      label: '处理人',
      id: 'assigneeId',
      model: 'assigneeId',
    },
  ];

  function getTypeOptions() {
    return [MaterialStatusEnum.LOT, MaterialStatusEnum.SN].map((value) => {
      return {
        value,
        label: t('sys.edhr.materialStatus.' + value),
      };
    });
  }

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
