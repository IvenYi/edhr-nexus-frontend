<template>
  <div class="flex flex-col h-full p-16px">
    <search-form
      :formData="formState"
      :initData="reverse ? reverseInitSearchList : initSearchList"
      :max-length="reverse ? reverseInitSearchList.length : initSearchList.length"
      @on-query="() => getTableData(1)"
    />

    <base-vxe-table
      class="h-100%"
      :tableColumns="columnDefinitions"
      :data-source="tableData"
      :loading="loading"
      showPagination
      :action="{ width: 100 }"
      v-model:pagination="pagination"
      @request-table-data="handleTableChange"
    >
      <template #operate="{ row }">
        <table-action-auto
          :actions="[
            {
              label: t('sys.detail'),
              onClick: () => handleView(row),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </base-vxe-table>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import SearchForm from '../../components/search-form/index.vue';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import {
    useApaasEbr,
    useInstanceStatus,
    useMaterialStatus,
    shouldShowFormSource,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import {
    getOnlineFormInstanceTracePageList,
    getOnlineFormInstanceReverseTracePageList,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import type { getOnlineFormInstancePageListQueryInterface } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { FIELD_TYPE } from '@gct/runtime';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { appInfo } = useAppInfoStore();

  const props = defineProps<{
    reverse: boolean;
  }>();

  const { t } = useI18n();

  const { getStatusOptions } = useMaterialStatus();

  const { openFillWikiFullScreenModal, openSingleDrawer } = useApaasEbr();
  const { getInstanceOptions } = useInstanceStatus();
  const loading = ref<boolean>(false);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const formState = reactive<getOnlineFormInstancePageListQueryInterface>({
    ofTmplName: undefined,
    submitterName: undefined,
    instanceStatus: undefined,
    startCreateTime: undefined,
    endCreateTime: undefined,
    modifyUserId: undefined,
    title: undefined,
    startCompletedTime: undefined,
    endCompletedTime: undefined,
    tmplId: undefined,
  });

  const tableData = ref<OnlineFormInstanceResponse[]>([]);

  // 判断当前是否在eDHR套件中
  const isEDHR = computed(() => appInfo.suiteKey === 'eDHR');

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.edhr.serialNo'),
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
      type: 'versionSelect',
      label: $t('sys.appDesigner.template'),
      id: 'tmplId',
      model: 'tmplId',
    },
    {
      type: 'select',
      label: $t('sys.type'),
      id: 'formType',
      model: 'formType',
      options: Object.values(FormTypeEnum)
        .filter((e) => (isEDHR.value && e !== FormTypeEnum.VIEW) || !isEDHR.value)
        .map((e) => {
          return {
            value: e,
            label: t(`sys.edhr.formTypeEnum.${e}`),
          };
        }),
    },
    {
      type: 'input',
      label: $t('sys.edhr.relateLotSn'),
      id: 'relatedMaterialNoValue',
      model: 'relatedMaterialNoValue',
    },
    {
      type: 'select',
      label: $t('sys.onlineForm.source'),
      id: 'businessType',
      model: 'businessType',
      options: getStatusOptions({ type: 'edhr' }),
    },
    {
      type: 'select',
      label: $t('sys.status'),
      id: 'instanceStatus',
      model: 'instanceStatus',
      options: getInstanceOptions({ type: 'edhrDocumentTracked' }),
    },
    {
      type: 'userSelect',
      label: t('sys.createUser'),
      id: 'createUserId',
      model: 'createUserId',
    },
    {
      type: 'dateRange',
      label: $t('sys.createTime'),
      startModel: 'startTaskCreateTime',
      endModel: 'endTaskCreateTime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },

    // {
    //   type: 'dateRange',
    //   label: '任务完成时间',
    //   startModel: 'startTaskCompletedTime',
    //   endModel: 'endTaskCompletedTime',
    //   format: 'YYYY-MM-DD HH:mm:ss',
    // },
  ];

  const reverseInitSearchList = [
    {
      type: 'lotTableSelect',
      label: t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      maxLength: 32,
      selectAttrs: {
        ignoreArchived: false,
        variant: 'auto',
        placeholder: $t('sys.edhr.inputOrSelect'),
      },
    },
    {
      type: 'treeTableSelect',
      label: t('sys.edhr.product'),
      id: 'productId',
      model: 'productId',
      modelKey: 'em_product',
      parentToDefault: true,
      hideSingleVersion: false,
      reverse: false,
    },
    // {
    //   type: 'versionSelect',
    //   label: '模板',
    //   id: 'tmplId',
    //   model: 'tmplId',
    // },
    {
      type: 'traceSelect',
      label: t('sys.model.device'),
      id: 'deviceId',
      model: 'deviceId',
      modelKey: 'em_device',
      fieldType: FIELD_TYPE.DEVICE,
      reverse: true,
    },
    {
      type: 'traceSelect',
      label: t('sys.pageDesigner.fieldCmp.mfg_order'),
      id: 'mfgOrderId',
      model: 'mfgOrderId',
      modelKey: 'em_mfg_order',
      fieldType: FIELD_TYPE.MFG_ORDER,
      reverse: true,
    },
    // {
    //   type: 'userSelect',
    //   label: '填报人',
    //   id: 'operatorId',
    //   model: 'operatorId',
    //   reverse: true,
    // },
    {
      type: 'input',
      label: t('sys.pageDesigner.fieldCmp.related_lot_no'),
      id: 'relatedLotNo',
      model: 'relatedLotNo',
      reverse: true,
    },
    {
      type: 'input',
      label: t('sys.pageDesigner.fieldCmp.record_no'),
      id: 'recordNo',
      model: 'recordNo',
      reverse: true,
    },
    {
      type: 'dateRange',
      label: t('sys.pageDesigner.fieldCmp.trace_date'),
      startModel: 'startTraceDate',
      endModel: 'endTraceDate',
      format: 'YYYY-MM-DD HH:mm:ss',
      reverse: true,
    },
    {
      type: 'input',
      label: t('sys.pageDesigner.fieldCmp.order_no'),
      id: 'orderNo',
      model: 'orderNo',
      reverse: true,
    },
  ];

  const columnDefinitions = [
    { title: $t('sys.edhr.serialNo'), field: 'serialNo', minWidth: 150 },
    { title: $t('sys.onlineForm.remarkName'), field: 'title', minWidth: 150 },
    { title: $t('sys.name'), field: 'tmplName', minWidth: 200 },
    { title: $t('sys.edhr.field.code'), field: 'ofCode', minWidth: 200 },
    {
      title: $t('sys.type'),
      field: 'formType',
      minWidth: 130,
      params: { i18nPrefix: 'sys.edhr.formTypeEnum', icon: true },
      slots: { default: 'value_i18n_render' },
    },
    {
      title: $t('sys.edhr.relateLotSn'),
      field: 'relatedMaterialNos',
      minWidth: 176,
      slots: { default: 'is_link_lot_list_render' },
    },
    { title: $t('sys.creator'), field: 'createUserName', minWidth: 130 },
    { title: $t('sys.createTime'), field: 'createTime', minWidth: 176 },
    { title: $t('sys.updatePerson'), field: 'modifyUserName', minWidth: 130 },
    { title: $t('sys.updateTime'), field: 'modifyTime', minWidth: 176 },
    {
      title: $t('sys.onlineForm.source'),
      field: 'businessType',
      minWidth: 110,
      fixed: 'right',
      slots: { default: 'material_status_render' },
    },
    {
      title: $t('sys.status'),
      field: 'instanceStatus',
      minWidth: 100,
      fixed: 'right',
      slots: { default: 'work_status_render' },
    },
  ];

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res = await (
      props.reverse ? getOnlineFormInstanceReverseTracePageList : getOnlineFormInstanceTracePageList
    )({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };

  onMounted(() => getTableData(1));

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleView = (record: OnlineFormInstanceResponse) => {
    // if (shouldShowFormSource(record)) {
    //   openFillWikiFullScreenModal({
    //     materialNo: record.materialNo,
    //     isViewPage: true,
    //     needAutoSave: false,
    //     params: {
    //       _gct_nocode_mfg_order_id_: record?.mfgOrderId,
    //     },
    //   });
    // } else {
    // }
    openSingleDrawer({
      selfId: record.id,
      keep: false,
      title: $t('sys.onlineForm.formDetail'),
      isViewPage: true,
      params: {
        _gct_nocode_mfg_order_id_: record?.mfgOrderId,
      },
    });
  };
</script>
<style lang="less" scoped></style>
