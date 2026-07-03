<template>
  <a-drawer
    v-model:visible="visible"
    width="800px"
    wrapClassName="create-edhr-instance-drawer-wrapper"
    :keyboard="false"
    v-bind="props.options"
    @close="handleCloseModal({ type: 'Cancel', title: $t('sys.cancel') })"
  >
    <div class="create-edhr-instance-drawer-container flex flex-col h-full p-16px">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="1" :tab="`DHR${$t('sys.pageDesigner.refList')}`">
          <div class="flex-col h-full flex">
            <!-- <div
              class="flex-none text-right mb-8px"
              v-if="baseProps.roleEdhrButtonPerm?.EDHRRelate"
            >
              <a-button type="primary" @click="onOpen">{{ $t('sys.edhr.materialStatus.LOT_SN_APPEND') }}eDHR</a-button>
            </div> -->
            <a-table
              class="flex-1 h-100px"
              row-key="id"
              :columns="columns"
              :data-source="tableData"
              :expand-icon-column-index="1"
              :pagination="false"
              :loading="loading"
              :expandIconColumnIndex="0"
              size="middle"
              ref="tableContainerRef"
              :scroll="{
                y: scrollHeight,
              }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'materialNo'">
                  <span
                    class="primary-gct cursor-pointer"
                    @click="
                      openFillWikiFullScreenModal({
                        materialNo: record.materialNo,
                        isViewPage: true,
                        needAutoSave: false,
                        params: {
                          _gct_nocode_mfg_order_id_: record.mfgOrderId,
                        },
                      })
                    "
                  >
                    {{ record.materialNo }}
                  </span>
                </template>
                <template v-if="column.key === 'actions'">
                  <table-action-auto
                    :actions="[
                      {
                        label: $t('sys.onlineForm.viewReferenceDetails'),
                        onClick: handleView.bind(null, record),
                      },
                      // {
                      //   label: t('sys.delete'),
                      //   color: 'error',
                      //   ifShow: baseProps.roleEdhrButtonPerm?.EDHRRelate,
                      //   popConfirm: {
                      //     title: t('sys.sureToDelete'),
                      //     confirm: handleDelete.bind(null, record),
                      //   },
                      // },
                    ]"
                    :stopButtonPropagation="true"
                  />
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="false" key="2" :tab="$t('sys.onlineForm.formAssociationList')">
          <div class="flex-col h-full flex">
            <div
              class="flex-none text-right mb-8px"
              v-if="baseProps.roleEdhrButtonPerm?.DocumentRelate"
            >
              <a-button type="primary" @click="openDocument">{{
                $t('sys.appDesigner.printDesign.form.refDocument')
              }}</a-button>
            </div>
            <a-table
              class="flex-1 h-100px"
              row-key="id"
              :columns="documentColumns"
              :data-source="documentTableData"
              :pagination="paginationParams"
              :loading="documentLoading"
              size="middle"
              ref="tableContainerRef"
              :scroll="{
                y: scrollHeight,
              }"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'actions'">
                  <table-action-auto
                    :actions="[
                      {
                        label: t('sys.delete'),
                        color: 'error',
                        ifShow: baseProps.roleEdhrButtonPerm?.DocumentRelate,
                        popConfirm: {
                          title: t('sys.sureToDelete'),
                          confirm: handleDeleteDocument.bind(null, record),
                        },
                      },
                    ]"
                    :stopButtonPropagation="true"
                  />
                </template>
                <template v-if="column.key === 'instanceStatus'">
                  <instance-status-label :instance-status="record.instanceStatus" />
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-drawer>
</template>

<script setup lang="ts" name="edhr-instance-relation-list">
  import { ref, onMounted, reactive } from 'vue';
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import type { TableColumnsType, ModalProps } from 'ant-design-vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';

  import CreateBindEdhrRelation from './create-bind-edhr-relation.vue';
  import {
    postEdhrInstanceRelation,
    deleteEdhrInstanceRelation,
  } from '/@/apis/gct-apaas/EdhrInstanceRelationController';

  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  import type { EdhrInstanceResponse } from '/@/apis/gct-apaas/model';

  // import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';
  import {
    getOnlineFormInstanceRelateFormPageList,
    deleteOnlineFormInstanceRelatedInstRemove,
    postOnlineFormInstanceRelatedInstUnbind,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { OnlineFormInstanceResponse } from '@mobile/apis/gct-apaas/model';
  import InstanceStatusLabel from '../utils/instance-status/instance-status-label.vue';
  import { useDocumentFilling } from '/@/projects/web-render/src/views/edhr-application/render/document-filling/useDocumentFilling';
  import EdhrRelationFormList from './edhr-relation-form-list.vue';
  import { useApaasEbr } from '../hooks';

  const { openFillWikiFullScreenModal } = useApaasEbr();

  const { t } = useI18n();
  const activeTab = ref('1');

  const columns: TableColumnsType = [
    // {
    //   title: t('sys.index'),
    //   key: 'index',
    //   width: 60,
    //   customRender: ({ text, record, index }) => {
    //     return index + 1;
    //   },
    //   align: 'center',
    // },

    {
      title: $t('sys.edhr.relateMaterialNo'),
      dataIndex: 'materialNo',
      key: 'materialNo',
      ellipsis: true,
    },

    {
      title: $t('sys.edhr.mfgOrderCode'),
      dataIndex: 'mfgOrderCode',
      key: 'mfgOrderCode',
      ellipsis: true,
    },

    {
      title: $t('sys.onlineForm.relatedProducts'),
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: $t('sys.onlineForm.bindEdhrLabel2'),
      dataIndex: 'tmplName',
      key: 'tmplName',
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
    },
  ];

  const documentColumns: TableColumnsType = [
    {
      title: t('sys.index'),
      key: 'index',
      width: 80,
      customRender: ({ text, record, index }) => {
        return index + 1;
      },
      align: 'center',
    },
    {
      title: $t('sys.appDesigner.printDesign.form.name2'),
      dataIndex: 'tmplName',
      key: 'tmplName',
      ellipsis: true,
      width: 220,
    },
    {
      title: $t('sys.edhr.formNo'),
      dataIndex: 'ofCode',
      key: 'ofCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: $t('sys.onlineForm.formRemarkName'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: true,
    },
    {
      title: $t('sys.instanceStatus'),
      dataIndex: 'instanceStatus',
      key: 'instanceStatus',
      width: 100,
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
    },
  ];

  // const { openEdhrViewDrawer } = useApaasEbr();

  const props = defineProps<{
    baseProps: {
      currentMaterialNo: string;
      /** edhr 实例id */
      edhrSelfId: string;
      roleEdhrButtonPerm: any;
    };
    options?: ModalProps;
    callback?: any;
  }>();

  const visible = ref<boolean>(true);

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const { handleCreate } = useDocumentFilling();

  const loading = ref<boolean>(false);
  const documentLoading = ref<boolean>(false);
  const tableData = ref<EdhrInstanceResponse[]>([]);
  const documentTableData = ref<OnlineFormInstanceResponse[]>([]);
  const paginationParams: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  onMounted(() => {
    getTableData();
    // getDocumentTableData();
  });

  function formatTree(list) {
    list.forEach((e) => {
      if (e.children && !e.children.length) {
        e.children = null;
      } else if (e.children) {
        formatTree(e.children);
      }
    });
  }

  async function getTableData() {
    if (!props.baseProps.edhrSelfId) return;

    loading.value = true;
    const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'gct_edhr_instance',
        bsKey: 'relationTreeById',
      },
      { id: props.baseProps.edhrSelfId },
      {},
    ).finally(() => {
      loading.value = false;
    });
    console.log('res', res);
    tableData.value = res ?? [];
    formatTree(tableData.value);
  }

  async function getDocumentTableData() {
    console.log('props.baseProps', props);
    documentLoading.value = true;
    const res: any = await getOnlineFormInstanceRelateFormPageList({
      materialNo: props.baseProps.currentMaterialNo,
      pageNo: paginationParams.current,
      pageSize: paginationParams.pageSize,
    }).finally(() => {
      documentLoading.value = false;
    });
    console.log('res', res);
    documentTableData.value = res?.data ?? [];
  }

  const handleTableChange = (paginationInfo) => {
    Object.assign(paginationParams, paginationInfo);
    getDocumentTableData();
  };

  function openDocument() {
    handleCreate({
      title: $t('sys.appDesigner.printDesign.form.refDocument'),
      callback: getDocumentTableData,
      form: { relatedMaterialNo: props.baseProps.currentMaterialNo },
      disabledMaterialNo: true,
    });
  }

  async function onOpen() {
    const result = await gct.openUtil.modal(
      CreateBindEdhrRelation,
      {
        context: {},
        params: {
          currentMaterialNo: props.baseProps.currentMaterialNo,
        },
      },
      {
        title: $t('sys.onlineForm.bindSubItem') + 'DHR',
        width: 640,
        showFooter: true,
      },
    );
    if (result && result.ok) {
      await postEdhrInstanceRelation({
        childInstId: result.data.childInstId, // 子eDHR实例ID
        instId: props.baseProps.edhrSelfId, // eDHR实例ID
      });

      message.success(t($t('sys.onlineForm.associationSuccess')));
      getTableData();
    }
  }

  async function handleDeleteDocument(record) {
    if (record.materialStatus === 'FORM') {
      await postOnlineFormInstanceRelatedInstUnbind({
        instId: record.id,
        relatedMaterialNo: props.baseProps.currentMaterialNo,
      });
    } else if (record.materialStatus === 'LOT_SN_APPEND') {
      await deleteOnlineFormInstanceRelatedInstRemove({
        instId: record.id,
      });
    }

    message.success(t('sys.delSuccess'));
    getDocumentTableData();
  }

  async function handleDelete(record) {
    await deleteEdhrInstanceRelation({ ids: record.instRelationId });
    message.success(t('sys.delSuccess'));
    getTableData();
  }

  async function handleView(record) {
    await gct.openUtil.modal(
      EdhrRelationFormList,
      {
        data: record.onlineFormInstanceList || [],
        materialNo: record.materialNo,
      },
      {
        title: $t('sys.onlineForm.referenceDetails'),
        width: 800,
        showFooter: false,
      },
    );
    // openEdhrViewDrawer(record.materialNo);
  }

  function handleCloseModal(btn) {
    visible.value = false;
    tableData.value = [];
  }
</script>

<style lang="less">
  .create-edhr-instance-drawer-wrapper {
    .ant-drawer-content {
      > .ant-drawer-wrapper-body {
        > .ant-drawer-header,
        > .ant-drawer-footer {
          flex-shrink: 0;
          padding: 16px;
        }

        > .ant-drawer-header {
          border-bottom: 1px solid #e0e3ea;
          .ant-drawer-close {
            color: #212528;
          }
        }

        > .ant-drawer-footer {
          border-top: 1px solid #e0e3ea;
          padding: 12px 16px;
          display: flex;
          justify-content: right;
        }

        > .ant-drawer-header .ant-drawer-title {
          color: #000;
          font-weight: 600;
        }

        > .ant-drawer-body {
          flex-grow: 1;
          padding: 0;
          display: flex;
          background-color: #fff;
          .create-edhr-instance-drawer-container {
            flex: 1;
            max-height: 100%;
            max-width: 100%;
          }
        }
      }
    }
  }
</style>

<style lang="less" scoped>
  :deep(.ant-tabs) {
    height: 100%;
  }
  :deep(.ant-tabs-content-holder) {
    .ant-tabs-content {
      height: 100%;
    }
  }
</style>
