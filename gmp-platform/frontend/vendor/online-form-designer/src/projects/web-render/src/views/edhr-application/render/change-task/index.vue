<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form :formData="formState" :initData="initSearchList" @on-query="getTableData" />
      <a-tabs class="flex-1" v-model:activeKey="activeTabKey">
        <a-tab-pane key="1" :tab="$t('sys.menu.myTodo')">
          <TaskTodo
            ref="TaskToDoRef"
            :can-handle="formTaskUsePermsHandle"
            @handle="(v) => handleBtnClick(v)"
            @detail="(v) => handleBtnClick(v, true)"
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
  import { useChangeTask, CHANGE_TYPE } from './useChangeTask';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TaskTodo from './todo.vue';
  import TaskDone from './done.vue';
  import { usePagePermissions } from '../../hooks/usePagePermissions';
  import SearchForm from '../../components/search-form/index.vue';
  import { MaterialStatusEnum, useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import DetailModal from './modals/detail.vue';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  const appInfoStore = useAppInfoStore();

  const isMedPro = () => {
    return appInfoStore.appInfo.suiteKey === 'MEDPRO';
  };

  const TaskToDoRef = ref();
  const TaskDoneRef = ref();
  const { formState, activeTabKey } = useChangeTask();
  const { t } = useI18n();
  const { openSingleDrawer, openFillWikiFullScreenModal } = useApaasEbr();

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.edhr.changedNo'),
      id: 'businessCode',
      model: 'businessCode',
    },
    {
      type: 'select',
      label: $t('sys.type'),
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
      label: $t('sys.webRender.onlineFormTitle'),
      id: 'title',
      model: 'title',
    },
    {
      type: 'versionSelect',
      label: $t('sys.edhr.formTmpl'),
      id: 'ofTmplId',
      model: 'ofTmplId',
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
  ];

  const formTaskUsePermsHandle = computed(() => {
    const page = isMedPro() ? 'audit-center' : 'change-task';
    return usePagePermissions(page)?.value[isMedPro() ? 'ChangeHandle' : 'Handle'];
  });

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

  /** 请求流程按钮配置 */
  async function fetchProcessButtonConfig(id, ofInstanceId) {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_process',
        bsKey: 'biz_button',
        modelCategory: 'entity',
      },
      { id },
    );

    if (!res) {
      return {
        showButtons: [],
        buttonConfig: '',
      };
    }
    const nodeDef = res.nodeDef ?? {};
    const showButtons = res.buttons;
    const buttonConfig = nodeDef.buttonConfig;

    return {
      showButtons: showButtons,
      buttonConfig: buttonConfig,
      taskId: res.taskId,
      ofInstanceId: ofInstanceId,
    };
  }

  async function handleBtnClick(record, isViewPage = false) {
    console.log('click', record, isViewPage);

    if (isViewPage) {
      openSingleDrawer({
        selfId: record.ofInstanceId,
        keep: false,
        isViewPage: true,
        title: $t('sys.detail'),
        params: {
          _gct_useDynRowHeight_: false,
          _gct_is_form_change_approval_page_: true,
          _gct_default_annotation_status_: true,
          _gct_change_business_code_: record.businessCode,
          _gct_change_business_id: record.businessId,
          _gct_nocode_mfg_order_id_: record.mfgOrderId,
        },
        renderFormInfo: DetailModal,
        callback: async () => getTableData(),
      });
    } else {
      const btnConfig = await fetchProcessButtonConfig(
        record.processInstanceId,
        record.ofInstanceId,
      );
      openSingleDrawer({
        selfId: record.ofInstanceId,
        keep: false,
        isViewPage: false,
        params: {
          _gct_useDynRowHeight_: false,
          _gct_is_form_change_approval_page_: true,
          _gct_form_change_approval_handle_: true, // 处理页面
          _gct_default_annotation_status_: true,
          _gct_change_business_code_: record.businessCode,
          _gct_change_business_id: record.businessId,
          _gct_form_change_process_btn: btnConfig,
          _gct_nocode_mfg_order_id_: record.mfgOrderId,
        },
        callback: async () => getTableData(),
      });
    }
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
