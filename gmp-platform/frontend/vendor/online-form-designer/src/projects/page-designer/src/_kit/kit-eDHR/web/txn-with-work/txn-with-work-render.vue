<template>
  <div class="online-form-list-render-wrapper relative flex flex-col h-100% overflow-hidden">
    <div class="relative overflow-hidden flex flex-col flex-[2]">
      <div class="py-10px split-line-border">
        <div
          class="relative pl-10px ml-16px flex items-center font-bold gct-text-overflow block-blank"
          >{{ title || $t('sys.edhr.txnWithWork.mainTitle') }}</div
        >
      </div>
      <Scrollbar class="relative px-12px pb-12px">
        <template v-if="listData && listData.length">
          <div
            v-for="(item, index) of listData"
            :key="index"
            class="list-item"
            @click.stop="onJumpToOnlineForm(item)"
          >
            <instance-status-label
              show-icon
              need-custom-class
              :form-type="item.formType!"
              :data-status="item.dataStatus"
              :instance-status="item.instanceStatus!"
              use-dynamic-color
              :is-form-summary="true"
            >
              <template #instanceTitle>
                <div class="list-item-title" :title="item.name">{{ item.name }}</div>
                <div v-if="item.required" class="list-item-required">{{
                  $t('sys.pageDesigner.required')
                }}</div>
              </template>
            </instance-status-label>
          </div>
        </template>

        <div
          class="flex justify-center items-center h-[100%] bg-[#fff] text-[#999999] pt-120px"
          v-else
        >
          <a-empty
            :description="$t('sys.noData')"
            :image="emptyImage"
            :imageStyle="{ width: '90px', height: '66px' }"
          />
        </div>
      </Scrollbar>
    </div>
    <div class="w-100% h-10px bg-[#f0f2f5]"></div>
    <div class="relative overflow-hidden flex flex-col flex-auto h-140px">
      <div class="py-10px flex items-center justify-between split-line-border">
        <div
          class="relative pl-10px ml-16px flex items-center font-bold gct-text-overflow block-blank"
          >{{ $t('sys.edhr.txnWithWork.appendix') }}</div
        >
        <div
          class="add-form-btn-area mr-8px"
          v-if="
            queryFormData.mainId &&
            queryFormData.productionIdentificationId &&
            queryFormData.status === 'running' &&
            !isViewPage &&
            getAppendixBtnVisible()
          "
          @click="onAddForm"
        >
          <i class="iconfont icon-tianjia1 !text-14px mr-4px"></i>
          <span>{{ $t('sys.edhr.txnWithWork.addForm') }}</span>
        </div>
      </div>
      <Scrollbar class="relative px-6px py-12px">
        <template v-if="appendixData && appendixData.length">
          <div
            class="content-item"
            v-for="(item, index) of appendixData"
            :key="index"
            @click="onJumpToOnlineForm(item)"
          >
            <div class="content-item--title">
              <CreateIcon v-if="item.type === 'LOT_SN_APPEND'" class="doc-icon" />
              <BindIcon v-else class="doc-icon" />
              <span class="title" :title="item.name || ''">
                {{ item.title || '-' }}
              </span>
              <instance-status-label
                :form-type="item.formType!"
                :data-status="item.dataStatus"
                :instance-status="item.instanceStatus!"
                use-dynamic-color
              />
              <i
                v-if="!isViewPage"
                class="iconfont icon-shanchu2 icon-delete ml-4px"
                @click.stop="onDeleteOnlineForm(item)"
              ></i>
              <i
                v-if="!isViewPage"
                class="icon iconfont icon-sheji-2 leading-none ml-4px primary-gct-hover"
                @click.stop="onEditTitle?.(item)"
              ></i>
            </div>
            <div class="content-item--content">
              <a-descriptions
                :column="1"
                :labelStyle="{ color: '#666', fontSize: '12px' }"
                :contentStyle="{ color: '#252525', fontSize: '12px' }"
              >
                <a-descriptions-item :label="$t('sys.onlineForm.formIdent')">
                  <copy-module-key :moduleKey="item.serialNo" :fontSize="12" />
                </a-descriptions-item>
                <a-descriptions-item :label="$t('sys.edhr.txnWithWork.formTmplName')">
                  {{ item.name }}
                </a-descriptions-item>
                <a-descriptions-item
                  :label="`${
                    isSN
                      ? $t('sys.edhr.txnWithWork.sourceSn')
                      : $t('sys.edhr.txnWithWork.sourceLot')
                  }`"
                >
                  <copy-module-key v-if="item.ext2" :moduleKey="item.ext2" :fontSize="12" />
                  <span v-else>-</span>
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
        </template>
        <div
          class="flex justify-center items-center h-[100%] bg-[#fff] text-[#999999] pt-64px"
          v-else
        >
          <a-empty
            :description="$t('sys.noData')"
            :image="emptyImage"
            :imageStyle="{ width: '90px', height: '66px' }"
          />
        </div>
      </Scrollbar>
    </div>
  </div>
  <AddAppendixFormDialog
    ref="addAppendixFormDialogRef"
    :txnModule="txnModule"
    @ok="addAppendixFormCallback"
  />
</template>

<script setup lang="ts" name="online-form-list-render">
  import { ref, reactive, toRef, watch, computed, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { ITxnWithWork } from './schema';
  import { E_BELONG_TYPE, E_BUSINESS_TYPE, E_FORM_APPEND_TYPE, E_FORM_OPE_TYPE } from './types';
  import { pick } from 'lodash-es';
  import { getPageEvent } from '../../../../components/widgets/hooks/hooks';
  import AddAppendixFormDialog from './dialog/add-appendix-form-dialog.vue';
  import EditSelfTitleDialog from './dialog/edit-self-title-dialog.vue';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import {
    useApaasEbr,
    InstanceStatusLabel,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import { Scrollbar } from '/@/components/Scrollbar';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import {
    deleteOnlineFormInstanceRelatedInstRemove,
    postOnlineFormInstanceRelatedInstUnbind,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import {
    postOnlineFormInstanceRelatedInstBind,
    postOnlineFormInstanceRelatedInstAppend,
  } from '/@/apis/gct-apaas/FormInstanceController';
  import { putInstanceRelationUpdateTitle } from '/@/apis/gct-apaas/InstanceRelationController';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import emptyImage from '/@/assets/images/pic_nodata.png';
  import BindIcon from './assets/bind-icon.vue';
  import CreateIcon from './assets/create-icon.vue';
  import { E_TXN_MODULE } from '../../../enums';

  const { openSingleDrawer, openFillWikiFullScreenModal } = useApaasEbr();

  const Event = getPageEvent();

  const defProps = defineProps<{
    widget: ITxnWithWork;
  }>();

  const {
    title,
    lotRefForm,
    lotField,
    mfgOrderId,
    operationField,
    txnModule,
    businessType,
    belongType,
    materialNoField,
    prodMaterialNoField,
    isViewPage,
    customdataSource,
    datasourceConfig,
    formInstBtnPerKey,
    appendixBtnPerKey,
  } = reactive(defProps.widget.props);

  const isSN = belongType === E_BELONG_TYPE.SN;

  const moduleType = computed(() => {
    if (txnModule) {
      return txnModule === E_TXN_MODULE.PRODUCTION ? 'dhr' : txnModule.toLocaleLowerCase();
    }

    return 'dhr';
  });

  const pageType = computed(() => {
    if (txnModule) {
      return txnModule === E_TXN_MODULE.PRODUCTION
        ? 'production-execution'
        : 'inspection-execution';
    }

    return 'production-execution';
  });

  const listData = ref<any[]>([]);

  const appendixData = ref<any[]>();

  const addAppendixFormDialogRef = ref();

  const additionalQueryParams = ref<Record<string, any>>({});
  const lotFormData = toRef(() => formMap.value[lotRefForm]);
  const queryFormData = computed(() => {
    return {
      // 工单ID
      mfgOrderId: lotFormData.value?.[mfgOrderId],
      // 批次/SN ID
      productionIdentificationId: lotFormData.value?.[lotField],
      // 工序/检验类型事务/放行类型事务ID
      mainId: lotFormData.value?.[operationField],
      // 批次号
      materialNo: lotFormData.value?.[materialNoField],
      /** 生产执行批次号（返工时关联的原生产标识号） */
      prodMaterialNo: lotFormData.value?.[prodMaterialNoField],
      // 状态
      status: lotFormData.value?.status_,
    };
  });

  let latestLoadId = 0;

  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            lotFormData.value,
            datasourceConfig?.extraParams,
          )
      : undefined;

  watch(
    queryFormData,
    () => {
      loadOnlineForm();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  function getAppendixBtnVisible() {
    if (!appendixBtnPerKey) {
      return true;
    }
    const perms = appendixBtnPerKey!.split('.');
    const pageId: string = perms[0];
    const key: string = perms[1];
    return getPermissionByKey(pageId, key);
  }

  async function requestData(params?) {
    if (customApi) {
      return customApi(params);
    }

    if (
      !queryFormData.value.mainId ||
      !queryFormData.value.productionIdentificationId ||
      (queryFormData.value.status !== 'running' && !isViewPage)
    ) {
      return [];
    }

    return (
      (await Event.context.$customBizService.post(
        { action: 'get_form', key: 'em_routing_operation_config' },
        {
          ...params,
          ...additionalQueryParams.value,
          [isSN ? 'sn_id_' : 'container_id_']:
            queryFormData.value.productionIdentificationId || undefined,
          business_type_: E_FORM_OPE_TYPE.DHR,
          routing_operation_id_: queryFormData.value.mainId || '',
          mfg_order_id_: queryFormData.value?.mfgOrderId || undefined,
        },
      )) || []
    );
  }

  async function loadOnlineForm(params?) {
    const myLoadId = ++latestLoadId; // 新请求的 id
    try {
      const res = await requestData(params);

      // 如果期间又发起了新的请求，此响应就是过期的，忽略它
      if (myLoadId !== latestLoadId) {
        return;
      }

      listData.value = res.filter((item) =>
        [E_FORM_OPE_TYPE.DHR, E_FORM_OPE_TYPE.REWORK, E_FORM_OPE_TYPE.INSPECTION].includes(
          item.type,
        ),
      );
      appendixData.value = res.filter((item) =>
        [E_FORM_OPE_TYPE.LOT_SN_APPEND, E_FORM_OPE_TYPE.LOT_RELATION].includes(item.type),
      );
    } catch (e) {
      if (myLoadId !== latestLoadId) return;
      listData.value = [];
      appendixData.value = [];
    }
  }

  async function onJumpToOnlineForm(item) {
    await Event.runEventByName(
      'beforeClick',
      defProps.widget.events,
      item.materialNo || queryFormData.value.materialNo,
      item,
      lotFormData.value,
    );
    // 检验类型也是按照DHR进行跳转
    if (
      [E_FORM_OPE_TYPE.DHR, E_FORM_OPE_TYPE.INSPECTION].includes(item.type) &&
      [E_BUSINESS_TYPE.PRODUCTION, E_BUSINESS_TYPE.INSPECTION].includes(
        businessType as E_BUSINESS_TYPE,
      )
    ) {
      const sopList = await Event.runEventByName('getSopList', defProps.widget.events);
      console.log('getSopList', sopList);
      openFillWikiFullScreenModal({
        materialNo: item.materialNo || queryFormData.value.materialNo,
        ofTmplId: item.docOutlineId || item.tmplId,
        ofInstanceId: item.ofInstId,
        viewPageLimit: isViewPage ? false : true,
        isViewPage: isViewPage,
        needAutoSave: true,
        pageType: pageType.value,
        formInstBtnPerKey,
        sopList,
        params: {
          _gct_nocode_business_id_: queryFormData.value.mainId,
          _gct_nocode_mfg_order_id_: queryFormData.value.mfgOrderId,
          _gct_nocode_ext1_: businessType,
          _gct_nocode_inst_query_params_: {
            //检验执行传参:txnNodeStatusId;生产执行传参:routingOperationId
            txnNodeStatusId:
              moduleType.value === 'inspection' ? queryFormData.value.mainId : undefined,
            routingOperationId: moduleType.value === 'dhr' ? queryFormData.value.mainId : undefined,
            [isSN ? 'snId' : 'containerId']:
              moduleType.value === 'dhr'
                ? queryFormData.value.productionIdentificationId
                : undefined,
          },
          _gct_nocode_material_params_: {
            materialStatus: item.materialStatus,
            productName: item.productName,
          },
        },
        callback: async () => {
          await loadOnlineForm();
          await Event.runEventByName('afterClick', defProps.widget.events);
        },
      });
    } else {
      openSingleDrawer({
        selfId: item.ofInstId,
        keep: false,
        isViewPage: isViewPage,
        params: {
          _gct_nocode_business_id_: queryFormData.value.mainId,
          _gct_nocode_mfg_order_id_: queryFormData.value?.mfgOrderId || undefined,
          _gct_nocode_ext1_: businessType,
          _gct_nocode_inst_query_params_: {
            //检验执行传参:txnNodeStatusId;生产执行传参:routingOperationId
            txnNodeStatusId:
              moduleType.value === 'inspection' ? queryFormData.value.mainId : undefined,
            routingOperationId: moduleType.value === 'dhr' ? queryFormData.value.mainId : undefined,
            [isSN ? 'snId' : 'containerId']:
              moduleType.value === 'dhr'
                ? queryFormData.value.productionIdentificationId
                : undefined,
          },
        },
        callback: async () => {
          await loadOnlineForm();
          await Event.runEventByName('afterClick', defProps.widget.events);
        },
      });
    }
  }

  async function onAddForm() {
    await addAppendixFormDialogRef.value.open({
      currentSourceCode: queryFormData.value.prodMaterialNo,
    });
  }

  async function addAppendixFormCallback(res) {
    const bindBusinessType =
      businessType === E_BUSINESS_TYPE.REWORK
        ? E_FORM_OPE_TYPE.REWORK
        : businessType === E_BUSINESS_TYPE.INSPECTION
          ? E_FORM_OPE_TYPE.INSPECTION
          : E_FORM_OPE_TYPE.DHR;
    if (res && res.bindType) {
      if (res.bindType === E_FORM_APPEND_TYPE.CREATE) {
        await postOnlineFormInstanceRelatedInstAppend({
          businessId: queryFormData.value.mainId,
          businessType: bindBusinessType,
          ext1: businessType,
          mfgOrderId: queryFormData.value?.mfgOrderId,
          ofRequired: Number(res.checked ?? false),
          relatedMaterialNo: queryFormData.value.materialNo,
          materialStatus: isSN ? 'SN' : 'LOT',
          title: res.title,
          tmplId: res.tmplId,
          module: moduleType.value,
        });
        message.success($t('sys.edhr.txnWithWork.addForm') + $t('sys.success'));
      } else if (res.bindType === E_FORM_APPEND_TYPE.BIND) {
        await postOnlineFormInstanceRelatedInstBind({
          businessId: queryFormData.value.mainId,
          businessType: bindBusinessType,
          instId: res.instId,
          relatedMaterialNo: queryFormData.value.materialNo,
          sourceMaterialNo: res.realSourceCode,
          mfgOrderId: queryFormData.value?.mfgOrderId || undefined,
          title: res.title,
          ext1: businessType,
          module: moduleType.value,
        });
        message.success($t('sys.edhr.txnWithWork.bindForm') + $t('sys.success'));
      }
      loadOnlineForm();
    }
  }

  async function onDeleteOnlineForm(item) {
    Modal.confirm({
      title: $t('sys.edhr.txnWithWork.deleteConfirm'),
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancelText'),
      closable: false,
      onOk: async () => {
        if ([E_FORM_OPE_TYPE.LOT_RELATION].includes(item.type)) {
          await postOnlineFormInstanceRelatedInstUnbind({
            instId: item.ofInstId,
            relatedMaterialNo: queryFormData.value.materialNo,
          });
        } else {
          await deleteOnlineFormInstanceRelatedInstRemove({
            instId: item.ofInstId,
          });
        }
        message.success($t('sys.edhr.txnWithWork.deleteForm') + $t('sys.success'));
        loadOnlineForm();
      },
      onCancel: () => {},
    });
  }

  async function onEditTitle(item) {
    const res: any = await gct.openUtil.modal(
      EditSelfTitleDialog,
      {
        data: pick(item, 'title'),
      },
      {
        title: $t('sys.edit') + $t('sys.onlineForm.formRemarkName'),
        width: 640,
        okText: $t('sys.okText'),
      },
    );
    if (res && res.ok) {
      await putInstanceRelationUpdateTitle(
        {
          ofInstId: item.ofInstId,
          title: res.params.title,
          materialNo: queryFormData.value.materialNo,
        },
        {
          joinParamsToUrl: true,
        },
      );
      message.success($t('sys.edit') + $t('sys.onlineForm.formRemarkName') + $t('sys.success'));

      // 刷新表单实例生成记录列表
      loadOnlineForm();
    }
  }

  function setAdditionalQueryParams(data: object) {
    Object.assign(additionalQueryParams.value, data ?? {});
  }

  function removeAdditionalQueryParams(keys: [string]) {
    keys.forEach((key) => {
      delete additionalQueryParams.value[key];
    });
  }

  onMounted(() => {
    Event.runEventByName('onMounted', defProps.widget.events);
  });

  defineExpose({
    async reload(params?) {
      return await loadOnlineForm(params);
    },
    reset() {
      listData.value = [];
      appendixData.value = [];
    },
    setAdditionalQueryParams,
    removeAdditionalQueryParams,
  });
</script>

<style lang="less" scoped>
  .add-form-btn-area {
    color: var(--ant-primary-color);
    cursor: pointer;
  }
  .split-line-border {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border-bottom: 1px solid #e8ecf0;
      pointer-events: none;
    }
  }

  .block-blank {
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 3px;
      height: 16px;
      transform: translateY(-50%);
      background: var(--ant-primary-color);
    }
  }

  .content-item {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid #e8ecf0;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 8px;

    &--title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      padding: 6px 8px;
      border-bottom: 1px solid #e8ecf0;
      overflow: hidden;
      .doc-icon {
        width: 24px;
        height: 24px;
        line-height: 1;
        display: block;
        margin-right: 4px;
        :deep(svg) {
          width: 24px;
          height: 24px;
          font-size: 24px;
          vertical-align: text-bottom;
        }
      }
      .title {
        color: #212528;
        flex: 1;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 4px;
      }

      .icon {
        display: none;
      }

      &:hover {
        .icon {
          display: inline-block;
        }
      }
    }

    &--content {
      padding: 6px 8px;
      cursor: pointer;

      :deep(.ant-descriptions-item) {
        padding-bottom: 4px !important;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: #f4f7ff;
      border: 1px solid var(--ant-primary-color);
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    }

    .icon-delete {
      line-height: 1;
      color: var(--ant-error-color);
      &:hover {
        color: var(--ant-error-color);
      }
    }
  }

  .list-item {
    position: relative;
    line-height: 24px;
    padding: 16px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border-bottom: 1px solid #e8ecf0;
      pointer-events: none;
    }

    .list-item-title {
      color: #212528;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 10px;
    }

    .list-item-required {
      color: #f54547;
      background: #ffeaea;
      border-radius: 2px;
      padding: 0 2px;
      font-size: 12px;
      line-height: 16px;
    }

    &:hover {
      .list-item-title {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
