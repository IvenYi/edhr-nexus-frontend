<template>
  <div class="p-16px flex flex-col h-full">
    <search-form :formData="formState" :initData="initSearchList" @on-query="getTableData" />
    <TaskTodo ref="TaskToDoRef" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useDocumentTask } from './useDocumentTask';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TaskTodo from './todo.vue';

  import { useMaterialStatus } from '/@online-form/views/integration/apaas_ebr/index';
  import SearchForm from '../../components/search-form/index.vue';

  const TaskToDoRef = ref();
  const { formState } = useDocumentTask();
  const { t } = useI18n();

  const { getStatusOptions } = useMaterialStatus();

  const initSearchList = [
    {
      type: 'select',
      label: $t('sys.recordType'),
      id: 'materialStatus',
      model: 'materialStatus',
      options: getStatusOptions(),
    },
    {
      type: 'lotTableSelect',
      label: $t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      selectAttrs: {
        variant: 'select',
        placeholder: '请选择',
      },
    },
    {
      type: 'input',
      label: $t('sys.formName'),
      id: 'ofTmplName',
      model: 'ofTmplName',
      maxLength: 32,
    },
    {
      type: 'treeTableSelect',
      label: $t('sys.product'),
      id: 'productId',
      model: 'productId',
      modelKey: 'em_product',
      parentToDefault: true,
      hideSingleVersion: false,
    },
    {
      type: 'edhrTmplSelect',
      label: $t('sys.edhr.edhrTmpl'),
      id: 'edhrTmplId',
      model: 'edhrTmplId',
      disabledParent: true,
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
