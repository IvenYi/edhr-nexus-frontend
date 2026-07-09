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
  import { CHANGE_TYPE } from '/@web-render/views/edhr-application/render/change-task/useChangeTask';

  const TaskToDoRef = ref();
  const { formState } = useDocumentTask();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: '变更编号',
      id: 'businessCode',
      model: 'businessCode',
    },
    {
      type: 'select',
      label: '类型',
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
      label: '表单备注名',
      id: 'title',
      model: 'title',
    },
    {
      type: 'versionSelect',
      label: '表单模板',
      id: 'ofTmplId',
      model: 'ofTmplId',
    },
    {
      type: 'userSelect',
      label: '创建人',
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
