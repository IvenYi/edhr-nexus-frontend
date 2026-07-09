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
      type: 'input',
      label: '编码',
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
