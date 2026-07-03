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

  import SearchForm from '../../../components/search-form/index.vue';
  import { CHANGE_TYPE } from '../../change-task/useChangeTask';

  const TaskToDoRef = ref();
  const { formState } = useDocumentTask();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.edhr.field.changeNo'),
      id: 'businessCode',
      model: 'businessCode',
    },
    {
      type: 'select',
      label: $t('sys.edhr.field.type'),
      id: 'taskType',
      model: 'taskType',
      options: Object.keys(CHANGE_TYPE).reduce((list, e) => {
        list.push({
          value: e,
          label: t('sys.edhr.changeType.' + e),
        });
        return list;
      }, []),
    },
    {
      type: 'input',
      label: $t('sys.onlineForm.formIdent'),
      id: 'serialNo',
      model: 'serialNo',
    },
    {
      type: 'input',
      label: $t('sys.onlineForm.formRemarkName'),
      id: 'title',
      model: 'title',
    },
    {
      type: 'versionSelect',
      label: $t('sys.edhr.field.onlineFormTmpl'),
      id: 'ofTmplId',
      model: 'ofTmplId',
    },
    {
      type: 'userSelect',
      label: $t('sys.edhr.field.createUser'),
      id: 'ofCreateUserId',
      model: 'ofCreateUserId',
    },
    {
      type: 'dateRange',
      label: $t('sys.edhr.field.createTime'),
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
