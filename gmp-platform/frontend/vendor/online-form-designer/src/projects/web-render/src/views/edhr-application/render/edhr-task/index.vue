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
          <TaskTodo
            ref="TaskToDoRef"
            :can-handle="formTaskUsePerms.Handle"
            @handle="(v) => handleBtnClick(v)"
          />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t('sys.menu.myDone')">
          <TaskDone ref="TaskDoneRef" @detail="(v) => handleBtnClick(v, true)" />
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
  import { MaterialStatusEnum } from '/@online-form/views/integration/apaas_ebr/index';
  import { openEdhrSummaryModal } from '../edhr-summary/index';
  import { FIELD_TYPE } from '@gct/runtime';

  const TaskToDoRef = ref();
  const TaskDoneRef = ref();
  const { formState, activeTabKey } = useDocumentTask();
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
        placeholder: $t('sys.chooseText'),
      },
      // maxLength: 32,
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
      type: 'select',
      label: $t('sys.edhr.field.recordType'),
      id: 'materialStatus',
      model: 'materialStatus',
      options: getTypeOptions(),
    },
    {
      type: 'userSelect',
      label: $t('sys.edhr.summaryUser'),
      id: 'starterId',
      model: 'starterId',
    },
  ];

  const filterInitSearchList = computed(() => {
    if (activeTabKey.value === '1') return initSearchList;
    else
      return initSearchList.concat([
        {
          type: 'dateRange',
          label: $t('sys.edhr.verifyTime'),
          startModel: 'startTime',
          endModel: 'endTime',
          format: 'YYYY-MM-DD HH:mm:ss',
        },
      ]);
  });

  const formTaskUsePerms = usePagePermissions('dhr-task');

  const getTableData = () => {
    if (activeTabKey.value === '1') {
      TaskToDoRef.value.getTableData(1);
    } else if (activeTabKey.value === '2') {
      TaskDoneRef.value.getTableData(1);
    }
  };

  function getTypeOptions() {
    return [MaterialStatusEnum.LOT, MaterialStatusEnum.SN].map((value) => {
      return {
        value,
        label: t('sys.edhr.materialStatus.' + value),
      };
    });
  }

  function handleBtnClick(record, detailMode = false) {
    openEdhrSummaryModal({
      detailMode,
      edhrInstId: record.edhrInstanceId,
      businessId: record.businessId,
      onClosed: (ok) => {
        if (ok) {
          TaskToDoRef.value?.getTableData();
          TaskDoneRef.value?.getTableData();
        }
      },
    });
  }
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
