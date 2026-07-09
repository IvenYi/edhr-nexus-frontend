<template>
  <div class="flex flex-col h-full p-16px">
    <search-form
      :formData="formState"
      :initData="searchData"
      :max-length="searchData.length"
      :row-length="3"
      @on-query="() => getTableData(1)"
    />

    <base-vxe-table
      class="h-100%"
      :tableColumns="columnDefinitions"
      :data-source="tableData"
      :loading="loading"
      showPagination
      v-model:pagination="pagination"
      @request-table-data="handleTableChange"
    >
      <template #custom_item="{ column: { field }, record }">
        <ProductPopover :id="record.productId" :name="record.productCode" />
      </template>
      <template #operate="{ row }">
        <table-action-auto :actions="getActions(row)" :stopButtonPropagation="true" />
      </template>
    </base-vxe-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed, createVNode } from 'vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { message, Modal, type TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import SearchForm from '../../components/search-form/index.vue';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import {
    useApaasEbr,
    useInstanceStatus,
    useMaterialStatus,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import {
    getEdhrInstancePageList,
    putEdhrInstanceUpdateInstanceStatusById4ArchivedById,
    getEdhrInstanceReversePageList,
  } from '/@/apis/gct-apaas/EdhrInstanceController';
  import type { getEdhrInstancePageListQueryInterface } from '/@/apis/gct-apaas/EdhrInstanceController';
  import type { EdhrInstanceResponse } from '/@/apis/gct-apaas/model';
  import ProductPopover from '../../components/product-popover/index.vue';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{ reverse: boolean }>();

  const formState: getEdhrInstancePageListQueryInterface & {
    mfgOrderId: string | undefined;
  } = reactive({
    beginDateTime: undefined,
    createUserId: undefined,
    endDateTime: undefined,
    materialNo: undefined,
    materialStatus: undefined,
    pageNo: undefined,
    pageSize: undefined,
    productId: undefined,
    sortField: undefined,
    sortType: undefined,
    tmplId: undefined,
    mfgOrderId: undefined,
    createUserName: undefined,
    startTime: undefined,
    endTime: undefined,
  });

  const { t } = useI18n();

  const { getStatusOptions } = useMaterialStatus();
  const { getInstanceOptions } = useInstanceStatus();

  const initSearchList = [
    {
      type: 'select',
      label: t('sys.webRender.edhrApplication.recordType'),
      id: 'materialStatus',
      model: 'materialStatus',
      options: getStatusOptions({ type: 'lot&sn' }),
      reverse: false,
    },
    {
      type: 'lotTableSelect',
      label: t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      selectAttrs: {
        ignoreArchived: false,
        variant: 'auto',
        placeholder: $t('sys.edhr.inputOrSelect'),
      },
      // maxLength: 32,
    },
    {
      type: 'traceSelect',
      label: $t('sys.edhr.dashboard.mfgOrderCode'),
      id: 'mfgOrderId',
      model: 'mfgOrderId',
      modelKey: 'em_mfg_order',
      fieldType: FIELD_TYPE.MFG_ORDER,
      selectAttrs: {
        variant: 'select',
        placeholder: $t('sys.chooseText'),
      },
      reverse: false,
    },
    {
      type: 'select',
      label: $t('sys.status'),
      id: 'instanceStatus',
      model: 'instanceStatus',
      options: getInstanceOptions({ type: 'edhr' }),
      reverse: false,
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
    {
      type: 'treeTableSelect',
      label: t('sys.edhr.product'),
      id: 'product',
      model: 'product',
      modelKey: 'em_product',
      parentToDefault: true,
      hideSingleVersion: false,
      reverse: true,
    },
    {
      type: 'traceSelect',
      label: t('sys.model.device'),
      id: 'device',
      model: 'device',
      modelKey: 'em_device',
      fieldType: FIELD_TYPE.DEVICE,
      reverse: true,
    },
    {
      type: 'traceSelect',
      label: t('sys.edhr.dashboard.mfgOrderCode'),
      id: 'mfgOrderId',
      model: 'mfgOrderId',
      modelKey: 'em_mfg_order',
      fieldType: FIELD_TYPE.MFG_ORDER,
      reverse: true,
    },
    {
      type: 'userSelect',
      label: t('sys.creator'),
      id: 'createUserId',
      model: 'createUserId',
      reverse: false,
    },
    // {
    //   type: 'userSelect',
    //   label: t('sys.updatePerson'),
    //   id: 'modifyUserId',
    //   model: 'modifyUserId',
    //   reverse: false,
    // },
    {
      type: 'userSelect',
      label: t('sys.webRender.edhrApplication.informant'),
      id: 'operatorId',
      model: 'operatorId',
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
      type: 'input',
      label: t('sys.pageDesigner.fieldCmp.related_lot_no'),
      id: 'relatedLotNo',
      model: 'relatedLotNo',
      reverse: true,
    },
    {
      type: 'dateRange',
      label: t('sys.createTime'),
      startModel: 'startTime',
      endModel: 'endTime',
      format: 'YYYY-MM-DD HH:mm:ss',
      reverse: false,
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
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 150 },
    {
      title: t('sys.edhr.dashboard.mfgOrderCode'),
      field: 'mfgOrderCode',
      minWidth: 130,
    },
    {
      title: $t('sys.onlineForm.productCode'),
      field: 'productCode',
      minWidth: 130,
      slots: { default: 'custom_render' },
    },
    { title: $t('sys.edhr.productName'), field: 'productName', minWidth: 200 },
    { title: $t('sys.edhr.spec'), field: 'spec', minWidth: 150 },
    { title: t('sys.edhr.name'), field: 'tmplName', minWidth: 150 },
    // { title: 'DHR' + '创建人', field: 'createUserName' },
    { title: t('sys.createTime'), field: 'createTime', minWidth: 176 },
    { title: t('sys.edhr.complishTime'), field: 'completedTime', minWidth: 176 },
    { title: t('sys.creator'), field: 'createUserName' },
    {
      title: t('sys.webRender.edhrApplication.recordType'),
      field: 'materialStatus',
      minWidth: 90,
      fixed: 'right',
      slots: { default: 'material_status_render' },
    },
    {
      title: t('sys.status'),
      field: 'instanceStatus',
      minWidth: 100,
      fixed: 'right',
      slots: { default: 'work_status_render' },
    },
  ];

  const { openFillWikiFullScreenModal } = useApaasEbr();

  const loading = ref<boolean>(false);
  const tableData = ref<EdhrInstanceResponse[]>([]);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const taggedMap = ref<{ outlineList: string[]; instList: string[] }>({
    outlineList: [],
    instList: [],
  });

  const searchData = computed(() => {
    return initSearchList.filter(
      (e) => !Object.hasOwn(e, 'reverse') || e.reverse === props.reverse,
    );
  });

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res = await (props.reverse ? getEdhrInstanceReversePageList : getEdhrInstancePageList)({
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

  const handleView = (record: EdhrInstanceResponse) => {
    getTaggedReverseData(record?.id);
    openFillWikiFullScreenModal({
      materialNo: record.materialNo,
      isViewPage: true,
      needAutoSave: false,
      taggedMap: taggedMap.value,
      params: {
        _gct_nocode_mfg_order_id_: record?.mfgOrderId,
      },
    });
  };

  async function getTaggedReverseData(edhrInstId) {
    if (!edhrInstId) {
      taggedMap.value = { outlineList: [], instList: [] };
      return;
    }
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_online_form_mainline',
        bsKey: 'biz_search_form_and_outline_ids',
      },
      {
        ...formState,
        edhrInstId,
      },
    );
    taggedMap.value.outlineList = res?.docOutlineIds || [];
    taggedMap.value.instList = res?.onlineFormInstanceIds || [];
  }

  const handleArchive = async (record: EdhrInstanceResponse) => {
    Modal.confirm({
      content: t('sys.edhr.archiveDhrConfirmTips'),
      icon: () =>
        createVNode(
          'span',
          {
            class: 'anticon anticon-exclamation-circle',
          },
          [
            createVNode('i', {
              class: 'iconfont icon-jinggao1',
              style: { position: 'relative', top: '3px', color: '#FF8C4B' },
            }),
          ],
        ),
      onOk: async () => {
        await putEdhrInstanceUpdateInstanceStatusById4ArchivedById({ id: record.id! });
        message.success(t('sys.doSuccess'));
        getTableData();
      },
    });
  };

  const getActions = (record: EdhrInstanceResponse) => {
    const result = [
      {
        label: t('sys.detail'),
        onClick: () => handleView(record),
      },
    ];

    // if (record.canArchived) {
    //   result.push({
    //     label: t('sys.edhr.archive'),
    //     onClick: () => handleArchive(record),
    //   });
    // }

    return result;
  };
</script>
