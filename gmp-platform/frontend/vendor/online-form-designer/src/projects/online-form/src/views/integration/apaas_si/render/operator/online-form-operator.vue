<template>
  <OnlineFormOperatorLayout
    :class="[ns.b(), ns.is('show-basic-info', isViewPage && inDrawer)]"
    :show-mask="currentMaskType !== MaskTypeEnum.NONE"
    :showFooter="isShowFooter"
    :showBasicInfo="isViewPage && inDrawer"
  >
    <template #default>
      <div v-if="selfId && (pageMessage || notifyMessage)" class="fill-message">
        <a-alert :message="notifyMessage || pageMessage" type="warning" show-icon closable />
      </div>
      <div :class="ns.e('body')">
        <div v-if="isViewPage && inDrawer" class="flex-shrink-0">
          <slot name="form-info">
            <collapse-detail
              :collapseInfo="collapseInfo"
              :defaultExpand="false"
              ref="collapseDetailRef"
            >
              <template #link_render_slot="{ item, slotData }">
                <related-material-no-label :data="item" :slotData="slotData" />
              </template>
            </collapse-detail>
          </slot>
        </div>
        <div class="flex overflow-hidden w-100% h-100%">
          <PreviewContainer
            :class="[ns.e('form')]"
            :loading="loading"
            :hasData="hasData"
            :basicInfoList="basicInfoList"
            :dataCenterMap="dataCenterMap"
            :formStateMap="formStateMap"
            :pageDataMap="pageDataMap"
            :defaultDataMap="defaultDataMap"
            :tmplBomCMap="tmplBomCMap"
            :updatePageData="updatePageData"
          />
          <change-log-list
            :showButtonKeys="showButtonKeys"
            :showAnnotation="showAnnotation"
            :items="annotationList"
            :cell-location="selectedCell"
            :paramExtraProps="paramExtraProps"
            @click-action="handleBuiltAction"
          />
        </div>
        <OcrHistoryBtn
          v-if="basicIns && showOCRHistoryBtn"
          :instance-id="basicIns.key"
          ref="ocrHistoryRef"
        />
      </div>
    </template>
    <template #mask>
      <OperationLogWrap
        v-if="currentMaskType === MaskTypeEnum.LOG"
        :tmpl-id="formIns.tmplId!"
        :instance-id="formIns.id"
        :model-key="formIns.modelKey"
        @close="handleBuiltinButtonClick('closeMask')"
      />
      <FlowPathWrap
        v-else-if="currentMaskType === MaskTypeEnum.FlowPath"
        :form-ins="formIns"
        @close="handleBuiltinButtonClick('closeMask')"
      />
    </template>

    <template #footer-left>
      <a-button
        v-for="buttonItem of filterButtons"
        :key="buttonItem.key"
        :class="[ns.e('left-btn')]"
        @click="handleBuiltinButtonClick(buttonItem.key)"
      >
        <i :class="['iconfont', buttonItem.icon]"></i>{{ buttonItem.title }}</a-button
      >
      <LoadDeviceBtn
        v-if="showLoadDeviceBtn"
        @select="onSelectTmpl"
        :runningTmplIds="mqttTmplIds"
      />
    </template>
    <template #footer-right>
      <div :class="[ns.e('action-bar')]">
        <AnnotationBuiltinActions
          :showButtonKeys="showButtonKeys"
          :showAnnotation="showAnnotation"
          :formChanging="formChanging"
          @click-action="handleBuiltAction"
        />
        <BaseButton
          v-for="item in actionButtonList"
          :key="item.type + '_' + item.buttonType"
          :class="[ns.e('btn')]"
          @click="handleBtnClick(item)"
          :title="item.customTitle"
          :loading="loadingMap[`${item.type}_${item.buttonType}`]"
          v-bind="{ ...(item.style || {}) }"
        />
      </div>
    </template>
  </OnlineFormOperatorLayout>
</template>

<script lang="ts" setup name="online-form-operator">
  import { ref, toRaw, computed, watch, reactive } from 'vue';
  import { useNamespace, CardControlEnum, IModalData, FIELD_TYPE } from '@gct/runtime';
  import PreviewContainer from '/@online-form/views/render/preview-container.vue';
  import BaseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import RelatedMaterialNoLabel from '../components/related-material-no-label.vue';

  import { isEmpty, has, debounce } from 'lodash-es';
  import { uuid2 } from '/@/utils/uuid';

  import { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import { message, Modal } from 'ant-design-vue';

  import { excBaseButton, excApprovalOperate } from '../../../../../approval';
  import {
    ErrorGroupPanel,
    FormTypeEnum,
    RenderModeEnum,
    PlatformEnum,
    useOnlineFormActionButton,
    useRenderPageFactory,
    ChangeType,
    useFormModel,
    useFormTmplConfig,
    InstanceStatusValues,
  } from '@gct/nocode-base';
  import {
    PrintModeEnum,
    FileModeEnum,
    useWebAnnotation,
    formPrint,
    initWebNocodeAdapter,
  } from '@gct/nocode-web-render';
  import { getConfigInfoByWeb } from '../../../utils/interface';
  import OnlineFormOperatorLayout from './online-form-operator-layout.vue';
  import AnnotationBuiltinActions from '../annotation/builtin-actions.vue';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';

  import OperationLogWrap from '../operation-log/operation-log-wrap.vue';
  import FlowPathWrap from '../flow-path/flow-path-wrap.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import { getOnlineFormInstanceDetail } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
  import type { IBasicInfoItem } from '@gct/nocode-base';
  import { IActionButtonItem } from '../types/index.d';
  import { useDeviceInterUpdateFormData } from '../../hooks/useDeviceInterconnection';
  import { useWatchOnlineFormLockById } from '../../hooks/useMqttConnect';
  import ChangeLogList from '../annotation/change-log-list.vue';
  import { openProcessModal } from '/@web-render/views/edhr-application/render/edhr-summary';
  import LoadDeviceBtn from '../device-link/load-device-btn.vue';
  import { useMonitorBrowser } from '../../hooks/useMonitorBrowser';
  import { useFormActionHandler } from '../../../utils/handle';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import OcrHistoryBtn from '../device-link/ocr-history/ocr-history-btn.vue';

  const appInfoStore = useAppInfoStore();
  const isInMedpro = computed(() => appInfoStore?.appInfo?.suiteKey === 'MEDPRO');

  const ns = useNamespace('online-form-operator');
  const { t } = useI18n();
  initWebNocodeAdapter();

  const CommonButtonOption = [
    {
      key: 'edhrView',
      title: t('sys.webRender.edhrApplication.eDHRView'),
      icon: 'icon-liucheng1',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        opts && opts.materialNo && !opts.hideLeftButtons?.includes('edhrView'),
    },
    {
      key: 'actionLog',
      title: t('sys.menu.operationLog'),
      icon: 'icon-a-caozuorizhi1',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(info.formType) &&
        !opts.hideLeftButtons?.includes('actionLog'),
    },
    {
      key: 'flowPath',
      title: t('sys.edhr.flowPath'),
      icon: 'icon-liuchenglujing22',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        info.formType === FormTypeEnum.PROCESS &&
        !opts.hideLeftButtons?.includes('flowPath'),
    },
    {
      key: 'singlePrint',
      title: t('sys.onlineForm.singlePrint'),
      icon: 'icon-a-dayin1',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        info.renderModeType === RenderModeEnum.ViewMode &&
        info.formType !== FormTypeEnum.FILE &&
        !opts.hideLeftButtons?.includes('singlePrint'),
    },
    {
      key: 'formChangeProcess',
      title: t('sys.edhr.changeProcess'),
      icon: 'icon-a-liuchengbiangeng',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        opts.isFormChangeApproval && !opts.hideLeftButtons?.includes('formChangeProcess'),
    },
    {
      key: 'checkList',
      title: t('sys.edhr.verificationChecklist'),
      icon: 'icon-bangzhu',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        info.renderModeType === RenderModeEnum.FormMode &&
        [FormTypeEnum.BASE, FormTypeEnum.PROCESS].includes(info.formType) &&
        !opts.hideLeftButtons?.includes('checkList'),
    },
  ];

  /** 是否显示mask并且显示什么内容 */
  enum MaskTypeEnum {
    NONE = 'NONE',
    LOG = 'LOG',
    FlowPath = 'FlowPath',
  }

  const props = withDefaults(
    defineProps<{
      /** 在线表单实例id */
      selfId: string;
      /** 批次号 */
      materialNo?: string;
      /** 是否在模态框中 */
      inDrawer: boolean;
      /** 是否是查看页面 */
      isViewPage?: boolean;
      /** 是否是记录本填报 */
      isRecordFill?: boolean;
      /** 按钮不走强制只读 */
      btnNotForceReadOnly?: boolean;
      /** 点击按钮后是否直接关闭弹框 */
      keep?: boolean;
      paramExtraProps?: Record<string, any>;
      /** 是否隐藏左侧按钮 */
      hideLeftButtons?: Array<string>;
      /** 显示的底部右侧按钮  */
      showRightBtns?: string[];
      /** 数据采集信息   */
      dataCollectionInfo?: any;
      /**头部消息 */
      pageMessage?: string;
      judgeFormDataHasChange?: Function;
      /** 自动保存时，存储的初始化的数据 */
      setAutoSaveInitData?: Function;
      /** 打印配置 */
      printConfig?: {
        apiMode: PrintModeEnum;
        fileMode: FileModeEnum;
      };
    }>(),
    {
      // printConfig: () => {
      //   return {
      //     apiMode: PrintModeEnum.ASYNC,
      //     fileMode: FileModeEnum.UN_ZIP,
      //   };
      // },
    },
  );

  const emit = defineEmits<{
    (e: 'btn-click-callback', btn: IActionButtonItem): void;
  }>();

  const currentMaskType = ref(MaskTypeEnum.NONE);

  const { renderActionButton, autoSaveButtonMap } = useOnlineFormActionButton();
  const { openEdhrViewDrawer } = useApaasEbr();
  /** 在线表单实例详情 */
  const formIns = computed<OnlineFormInstanceResponse>(() => findFormInsInfo(props.selfId) ?? {});
  /** 当前页面基础信息 */
  const basicIns = computed<IBasicInfoItem | undefined>(() => findBasicInsInfo(props.selfId));

  const filterButtons = computed(() =>
    CommonButtonOption.filter((buttonItem) =>
      buttonItem.isShow(basicIns.value, {
        materialNo: props.materialNo,
        isFormChangeApproval: props.paramExtraProps?._gct_is_form_change_approval_page_,
        hideLeftButtons: props.hideLeftButtons,
      }),
    ),
  );
  const {
    counter,
    finisher,
    loading,
    hasData,
    basicInfoList,
    pageDataMap,
    formStateMap,
    dataCenterMap,
    defaultDataMap,
    tmplBomCMap,
    updatePageData,
    validate,
    getFormState,
    setFromEditStatus,
    setAnnotationViewStatus,
    getAnnotationContentList,
    quickSearchRenderData,
    setValidatorViewStatus,
    findFormInsInfo,
    findBasicInsInfo,
    updateRenderModeType,
    getAppendixInfos,
  } = useRenderPageFactory(props, {
    factoryType: 'instance',
    requestCallback: getOnlineFormInstanceDetail,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isDetailPage: () => props.isViewPage,
    getBtnDisplayRules: () => props.btnNotForceReadOnly,
    paramExtraProps: props.paramExtraProps,
    deviceConfig: getConfigInfoByWeb(),
    isMockReport: false,
    onFinisher: (selfId, renderModeType) => {
      updateLockStatus(selfId, renderModeType === RenderModeEnum.ViewMode);
    },
    formPrint,
    afterProcessData: props.setAutoSaveInitData,
  });

  // 初始化表单模板配置数据
  const formTmplC = useFormTmplConfig().provideController();
  watch(
    () => formIns.value?.tmplId,
    (val) => {
      if (val) {
        formTmplC.init({
          tmplId: val.split(':')[1],
        });
      }
    },
  );

  const ocrHistoryRef = ref();

  const { selectTemplate, unsubscribe, mqttTmplIds } = useDeviceInterUpdateFormData({
    formStateMap,
    basicIns,
    updatePageData,
    ocrHistoryRef,
    formTmplC,
  });
  const { notifyMessage, updateLockStatus, checkedEditFormByUser } = useWatchOnlineFormLockById(
    computed(() => props.selfId),
    {
      /**编辑 只读状态切换 */
      onLockChange: (isViewPage) => {
        const uniqueId = basicIns.value?.uniqueId ?? '';
        if (isViewPage) {
          /**变成查询的时候需要关闭设备互联的mqtt */
          unsubscribe();
          updateRenderModeType(uniqueId, RenderModeEnum.ViewMode, true);
        } else {
          updateRenderModeType(uniqueId, RenderModeEnum.FormMode, false);
        }
      },
      /**表格数据更新 */
      onReload: () => {
        counter.value++;
      },
    },
  );

  // 监听浏览器关闭
  useMonitorBrowser({
    beforeUnload: async () => {
      const res =
        props.judgeFormDataHasChange &&
        (await props.judgeFormDataHasChange(() => {}, false, false));
      return res;
    },
  });

  const onNotifyTips = ({ fields, showValidateCheckList, clearValidator }) => {
    const uniqueId = basicIns.value?.uniqueId ?? '';
    const subTableInfo = formIns.value.newBackupInfo.subTableInfo;
    const updateValidatorStatus = (data = {}) => {
      setValidatorViewStatus(uniqueId, data);
    };

    if (showValidateCheckList) {
      updateValidatorStatus(fields);
      gct.openUtil.modal<IModalData>(
        ErrorGroupPanel,
        {
          errorMap: fields,
          subTableInfo,
        },
        { title: $t('sys.edhr.errorFieldsList'), width: 820, height: 540, showCancelBtn: false },
      );
      return;
    }

    if (clearValidator) {
      updateValidatorStatus();
    } else {
      updateValidatorStatus(fields);
      message.warn($t('sys.edhr.fieldsVerificationFailed'));
    }
  };

  const {
    collapseInfo,
    actionButtonList,
    loadingMap,
    requestInterfaceByButtonKey,
    handleBtnClick,
  } = useFormActionHandler(props, {
    isMedPro: isInMedpro.value,
    formInfo: formIns,
    renderActionButton,
    getType: () => {
      return {
        bpmnType: basicIns.value?.bpmnType!,
        modeType: basicIns.value?.btnRenderModeType!,
      };
    },
    getAppendixInfos: () => {
      const uniqueId = basicIns.value?.uniqueId ?? '';
      return getAppendixInfos(uniqueId, formIns.value, [FIELD_TYPE.ATTACHMENT]);
    },
    getFormState: async () => {
      const uniqueId = basicIns.value?.uniqueId ?? '';
      return await getFormState(uniqueId);
    },
    validate: async (bool: boolean) => {
      const uniqueId = basicIns.value?.uniqueId ?? '';
      return await validate(bool, uniqueId, onNotifyTips);
    },
    updateCounter: () => {
      counter.value++;
    },
    onSuccess: (btn) => {
      emit('btn-click-callback', btn);
    },
  });

  /** 批注相关 */
  const {
    selectedCell,
    annotationList,
    showAnnotation,
    formChanging,
    showButtonKeys,
    handleBuiltAction,
    initState,
  } = useWebAnnotation({
    formIns: formIns,
    basicIns: basicIns,
    needAbandonBtn: !props.inDrawer && !props.materialNo,
    paramExtraProps: props.paramExtraProps,
    dataCollectionInfo: props.dataCollectionInfo,
    formRef: {
      getFormState,
      setFromEditStatus,
      setAnnotationViewStatus,
      getAnnotationContentList,
    },
    onBtnClick: (btn) => {
      handleBtnClick(btn);
    },
    checkedEditFormByUser: () => checkedEditFormByUser(props.selfId),
    onVisibleChange: (visible) => {},
  });

  const isShowFooter = computed(() => {
    return (
      showButtonKeys.value.length !== 0 ||
      actionButtonList.value.length !== 0 ||
      filterButtons.value.length !== 0
    );
  });

  watch(
    () => props.selfId,
    () => {
      currentMaskType.value = MaskTypeEnum.NONE;
      initState();
    },
  );

  // 只对打印逻辑做防抖（800ms 内多次点击只触发一次）
  const debouncedPrint = debounce(
    () => {
      postFileTaskSubmit({
        tmplInstantId: props.selfId,
        type: 'FORM',
      });
      message.success($t('sys.edhr.printTaskCreationWasSuccessful'));
    },
    300,
    { leading: false, trailing: true },
  );

  function handleBuiltinButtonClick(key) {
    if (key === 'edhrView') {
      openEdhrViewDrawer(props.materialNo);
    } else if (key === 'actionLog') {
      currentMaskType.value = MaskTypeEnum.LOG;
    } else if (key === 'flowPath') {
      currentMaskType.value = MaskTypeEnum.FlowPath;
    } else if (key === 'singlePrint') {
      // if (!showBuiltinBtn && currentModeType.value === RenderModeEnum.ViewMode) {
      // window.print();
      // } else {
      //   onEbrSinglePrint(selfInfo.value.tmplId!, selfInfo.value);
      // }
      if (props?.printConfig?.apiMode === PrintModeEnum.ASYNC) {
        formPrint(props.selfId, props.printConfig);
      } else {
        debouncedPrint();
      }
    } else if (key === 'closeMask') {
      currentMaskType.value = MaskTypeEnum.NONE;
    } else if (key === 'checkList') {
      const uniqueId = basicIns.value?.uniqueId ?? '';

      validate(false, uniqueId, onNotifyTips)
        .then((res) => {
          if (res && res.isValid) {
            message.success($t('sys.edhr.fillingFieldsVerified'));
          }
        })
        .catch((error) => {
          if (error.callback && typeof error.callback === 'function') {
            error.callback({ showValidateCheckList: true });
          }
        });
    } else if (key === 'formChangeProcess') {
      openProcessModal({
        instId: annotationList.value?.[0].processInstId,
        processId: annotationList.value?.[0].processId,
        title: $t('sys.edhr.formChangeProcess'),
      });
    }
  }

  /** 快速保存方法 */
  async function quickSaveData(isAutoSave = true) {
    let btn;
    if (formIns.value?.formType === FormTypeEnum.BASE) {
      btn = autoSaveButtonMap[FormTypeEnum.BASE];
    } else if (formIns.value?.formType === FormTypeEnum.PROCESS) {
      btn = autoSaveButtonMap[FormTypeEnum.PROCESS];
    }
    if (btn) {
      await requestInterfaceByButtonKey(btn, isAutoSave, undefined, 0);

      if (isAutoSave) {
        // 表单需要合并id
        const uniqueId = basicIns.value?.uniqueId ?? '';
        await quickSearchRenderData(uniqueId, formIns.value);

        message.success($t('sys.edhr.dataAutosavedSuccessfully'));
      } else {
        message.success($t('sys.edhr.dataSavedSuccessfully'));
      }
    }
  }

  function onSelectTmpl(data) {
    const fieldPermission = formIns.value?.processFieldPermission
      ? JSON.parse(formIns.value?.processFieldPermission)
      : '';
    const nodeConfig = formIns.value?.ofProcessOperations?.nodeDef?.fieldConfig
      ? JSON.parse(formIns.value?.ofProcessOperations?.nodeDef?.fieldConfig)
      : '';
    selectTemplate({ ...data, fieldPermission: nodeConfig || fieldPermission || [] });
  }

  // 初始化表单模板模型数据
  const { provideController } = useFormModel();
  const formModelC = provideController();
  watch(
    () => formIns.value?.modelKey,
    (val) => {
      if (val) {
        formModelC.init({
          model: val,
          name: formIns.value?.tmplName,
        });
      }
    },
  );

  /** 是否显示加载设备数据按钮 */
  const showLoadDeviceBtn = computed(() => {
    return (
      basicIns.value?.renderModeType === RenderModeEnum.FormMode &&
      (formTmplC.state.IOTPermission || formTmplC.state.OCRPermission)
    );
  });

  /** 是否显示OCR历史按钮 */
  const showOCRHistoryBtn = computed(() => {
    return appInfoStore?.appInfo?.suiteKey === 'eDHR' && formTmplC.state.OCRPermission;
  });

  defineExpose({
    /** 设置自动保存 */
    quickSaveData,
  });
</script>

<style lang="scss" scoped>
  $online-form-operator: ();

  @include b(online-form-operator) {
    @include set-component-css-var(online-form-operator, $online-form-operator);

    @include e(body) {
      @include e(form) {
        flex: 1 1 auto;
      }

      @include e(annotation) {
        flex-shrink: 0;
        width: 279px;
      }

      display: flex;
      height: 100%;
      overflow: auto;
    }

    @include e(action-bar) {
      flex: 0 0 auto;
      // background: #ffffff;
      padding-right: 24px;
      // height: 62px;
      // line-height: 62px;
      text-align: right;
    }

    @include e(btn) {
      margin-left: 8px;
    }

    @include e(left-btn) {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      .iconfont {
        margin-right: 6px;
        font-size: 14px;
        line-height: 1;
      }
    }

    @include when(show-basic-info) {
      @include e(body) {
        @include e(form) {
          background-color: #e6e9ef;
        }

        flex-direction: column;
      }
    }

    display: flex;
    flex-direction: column;
  }

  .fill-message {
    position: absolute;
    z-index: 999;
    width: 100%;

    .ant-alert {
      padding: 12px 16px;
      border-color: #fff7f2;
      border-bottom-color: #ff792e;
      background-color: #fff7f2;
      font-size: 15px;

      .ant-alert-icon {
        color: #ff792e;
      }
    }
  }
</style>
