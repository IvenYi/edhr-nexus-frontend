<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form :formData="formState" :initData="initSearchList" @on-query="getTableData" />

      <a-tabs class="flex-1" v-model:activeKey="activeTabKey">
        <template #rightExtra>
          <a-button v-if="formFillingUsePerms.Insert" type="primary" @click="handleTaskCreate"
            >{{ $t('sys.new') }}</a-button
          >
        </template>

        <a-tab-pane key="1" :tab="$t('sys.edhr.myFilling')">
          <DocumentTodo
            ref="DocumentTodoRef"
            :can-fill="formFillingUsePerms.Fill"
            :can-forward="formFillingUsePerms.Forward"
          />
        </a-tab-pane>

        <a-tab-pane key="2" :tab="$t('sys.developer.appCenter.tabMineCreate')">
          <DocumentCreated
            ref="DocumentCreatedRef"
            :can-update="formFillingUsePerms.Update"
            :can-resend="formFillingUsePerms.Resend"
            :can-delete="formFillingUsePerms.Delete"
          />
        </a-tab-pane>

        <a-tab-pane key="3" :tab="$t('sys.edhr.myFilled')">
          <DocumentFinished ref="DocumentFinishedRef" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useDocumentFilling } from './useDocumentFilling';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DocumentTodo from './todo.vue';
  import DocumentCreated from './created.vue';
  import DocumentFinished from './finished.vue';
  import SearchForm from '../../components/search-form/index.vue';
  import { usePagePermissions } from '../../hooks/usePagePermissions';

  const DocumentTodoRef = ref();
  const DocumentCreatedRef = ref();
  const DocumentFinishedRef = ref();
  const { formState, activeTabKey, handleCreate } = useDocumentFilling();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.pageDesigner.name'),
      id: 'tmplName',
      model: 'tmplName',
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
      label: $t('sys.edhr.relateMaterialNo'),
      id: 'relatedMaterialNo',
      model: 'relatedMaterialNo',
      maxLength: 32,
    },
    {
      type: 'userSelect',
      label: t('sys.creator'),
      id: 'createUserId',
      model: 'createUserId',
    },
    {
      type: 'dateRange',
      label: t('sys.createTime'),
      startModel: 'startTime',
      endModel: 'endTime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    // {
    //   type: 'userSelect',
    //   label: t('sys.updatePerson'),
    //   id: 'modifyUserId',
    //   model: 'modifyUserId',
    // },
  ];

  const formFillingUsePerms = usePagePermissions('document-filling');

  const getTableData = () => {
    if (activeTabKey.value === '1') {
      DocumentTodoRef.value.getTableData(1);
    } else if (activeTabKey.value === '2') {
      DocumentCreatedRef.value.getTableData(1);
    } else if (activeTabKey.value === '3') {
      DocumentFinishedRef.value.getTableData(1);
    }
  };

  const handleTaskCreate = () => {
    handleCreate({
      callback: () => {
        getTableData();
      },
    });
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
  }
</style>
