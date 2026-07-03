<template>
  <div>
    <div
      v-if="notifyMessage"
      class="sticky w100% text-16px text-[#1A1D23] text-center bg-[#fff7f2] top-0 z-9999 leading-[50px] h-[50px]"
    >
      {{ notifyMessage }}
    </div>
    <MobilePreviewContainer
      :loading="loading"
      :hasData="hasData"
      :basicInfoList="basicInfoList"
      :dataCenterMap="dataCenterMap"
      :formStateMap="formStateMap"
      :pageDataMap="pageDataMap"
      :defaultDataMap="defaultDataMap"
      :updatePageData="updatePageData"
    />
  </div>
</template>

<script lang="ts" setup name="MobileOnlineFormOperator">
  import { toRaw, computed, reactive } from 'vue';
  import { isEmpty, has } from 'lodash-es';
  import { showToast, showNotify, showConfirmDialog } from 'vant';
  import { CardControlEnum, FIELD_TYPE } from '@gct/runtime';
  import { i18n } from '@mobile/locales/setupI18n';
  import {
    FormTypeEnum,
    PlatformEnum,
    useOnlineFormActionButton,
    useRenderPageFactory,
    commonUtils,
    RenderModeEnum,
    InstanceStatusValues,
  } from '@gct/nocode-base';
  import { getConfigInfoByMobile } from '../../logic/index';
  import MobilePreviewContainer from '../../components/mobile-preview-container.vue';
  import { excBaseButton, excApprovalOperate } from '../../components/_common_/approval-modal';
  import { getOnlineFormInstanceInfo } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { GctPopup } from '@mobile/utils/popup';
  import type { IBasicInfoItem } from '@gct/nocode-base';
  import type { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import ValidateCheckListPopup from '../form-ins/validate-check-list-popup.vue';
  import { useWatchOnlineFormLockById } from '../../hooks/useMqttConnect';
  import { useMobileAnnotation } from '../annotation';

  const { t } = i18n.global;

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
      title: t('流程路径'),
      icon: 'icon-liuchenglujing22',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        info.formType === FormTypeEnum.PROCESS &&
        !opts.hideLeftButtons?.includes('flowPath'),
    },
    // {
    //   key: 'singlePrint',
    //   title: t('sys.onlineForm.singlePrint'),
    //   icon: 'icon-a-dayin1',
    //   isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
    //     info &&
    //     info.renderModeType === RenderModeEnum.ViewMode &&
    //     info.formType !== FormTypeEnum.FILE &&
    //     !opts.hideLeftButtons?.includes('singlePrint'),
    // },
    {
      key: 'formChangeProcess',
      title: t('变更流程'),
      icon: 'icon-a-liuchengbiangeng',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        opts.isFormChangeApproval && !opts.hideLeftButtons?.includes('formChangeProcess'),
    },
    {
      key: 'checkList',
      title: t('校验清单'),
      icon: 'icon-bangzhu',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        info.renderModeType === RenderModeEnum.FormMode &&
        [FormTypeEnum.BASE, FormTypeEnum.PROCESS].includes(info.formType) &&
        !opts.hideLeftButtons?.includes('checkList'),
    },
    {
      key: 'moreInfo',
      title: t('查看更多'),
      icon: 'icon-bangzhu',
      isShow: (info: IBasicInfoItem | undefined, opts?: any) =>
        info &&
        info.renderModeType === RenderModeEnum.ViewMode &&
        !opts.hideLeftButtons?.includes('moreInfo'),
    },
  ] as const;

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
      isMedPro?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'btn-click-callback', btn: any): void;
  }>();

  const { renderActionButton, autoSaveButtonMap } = useOnlineFormActionButton();

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
    getAppendixInfos,
    updateRenderModeType,
  } = useRenderPageFactory(props, {
    factoryType: 'instance',
    requestCallback: getOnlineFormInstanceInfo,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isDetailPage: () => props.isViewPage,
    paramExtraProps: props.paramExtraProps,
    deviceConfig: getConfigInfoByMobile(),
    isMockReport: false,
    onFinisher: (selfId, renderModeType) => {
      updateLockStatus(selfId, renderModeType === RenderModeEnum.ViewMode);
    },
  });

  const { notifyMessage, updateLockStatus } = useWatchOnlineFormLockById(
    computed(() => props.selfId),
    {
      /**编辑 只读状态切换 */
      onLockChange: (isViewPage) => {
        const uniqueId = basicIns.value?.uniqueId ?? '';
        if (isViewPage) {
          updateRenderModeType(uniqueId, RenderModeEnum.ViewMode, true);
        } else {
          updateRenderModeType(uniqueId, RenderModeEnum.FormMode, true);
        }
      },
      /**表格数据更新 */
      onReload: () => {
        counter.value++;
      },
    },
  );

  /** 在线表单实例详情 */
  const formIns = computed<OnlineFormInstanceResponse>(() => findFormInsInfo(props.selfId) ?? {});
  /** 当前页面基础信息 */
  const basicIns = computed<IBasicInfoItem | undefined>(() => findBasicInsInfo(props.selfId));

  const loadingMap = reactive({});
  // 当前是否有按钮正在 loading
  const isAnyLoading = computed(() => {
    const values = Object.values(loadingMap);
    return values.length > 0 && values.some((v) => v);
  });

  // 当前操作按钮列表
  const actionButtonList = computed(() => {
    let showButtons, buttonConfig;

    const formType = formIns.value.formType as FormTypeEnum;
    if (props.paramExtraProps?._gct_is_form_change_approval_page_) {
      showButtons = props.paramExtraProps?._gct_form_change_process_btn?.showButtons || [];
      buttonConfig = props.paramExtraProps?._gct_form_change_process_btn?.buttonConfig || '';
    } else if (formType === FormTypeEnum.BASE || formType === FormTypeEnum.FILE) {
      buttonConfig = formIns.value?.operation;
    } else if (formType === FormTypeEnum.PROCESS) {
      const processInfo = formIns.value?.ofProcessOperations ?? {};
      const nodeDef = processInfo.nodeDef ?? {};
      // 作废审核中的表单，不可以做任何操作
      if (formIns.value.instanceStatus !== InstanceStatusValues.IN_AUDIT) {
        showButtons = processInfo.buttons;
        buttonConfig = nodeDef.buttonConfig;
      }
    }
    let buttonList = renderActionButton(showButtons ?? [], buttonConfig ?? [], {
      formType,
      bpmnType: basicIns.value?.bpmnType!,
      modeType: basicIns.value?.btnRenderModeType!,
      inDrawer: props.inDrawer,
      isViewPage: props.isViewPage,
      isRecordFill: props.isRecordFill,
      processOperation: formIns.value?.processOperation,
      isFormChangeApprovalPage: props.paramExtraProps?._gct_is_form_change_approval_page_,
      isMedPro: props.isMedPro,
    });

    if (props.showRightBtns) {
      buttonList = buttonList.filter((i) => props.showRightBtns?.includes(i.type));
    }
    return buttonList;
  });

  const actionButtonListWithLoading = computed(() =>
    actionButtonList.value.map((item) => ({
      ...item,
      loading: loadingMap[`${item.type}_${item.buttonType}`],
    })),
  );

  const basicBuiltinButtons = computed(() =>
    CommonButtonOption.filter((buttonItem) =>
      buttonItem.isShow(basicIns.value, {
        materialNo: props.materialNo,
        isFormChangeApproval: props.paramExtraProps?._gct_is_form_change_approval_page_,
        hideLeftButtons: props.hideLeftButtons,
      }),
    ),
  );

  const isShowFooter = computed(() => {
    return actionButtonList.value.length !== 0 || basicBuiltinButtons.value.length !== 0;
  });

  const onNotifyTips = ({
    fields,
    showValidateCheckList,
    clearValidator,
    message: messageJson,
  }) => {
    const uniqueId = basicIns.value?.uniqueId ?? '';
    const subTableInfo = formIns.value.newBackupInfo.subTableInfo;
    const updateValidatorStatus = (data = {}) => {
      setValidatorViewStatus(uniqueId, data);
    };

    if (showValidateCheckList) {
      updateValidatorStatus(fields);
      GctPopup.open(ValidateCheckListPopup, {
        errorMap: fields,
        subTableInfo,
      });
      return;
    }

    if (clearValidator) {
      updateValidatorStatus();
    } else {
      updateValidatorStatus(fields);
      if (messageJson) {
        const { showModelName, showFieldName, targetFieldId, message } = JSON.parse(messageJson);

        const fieldLabel =
          showModelName && showFieldName
            ? `模型【${showModelName}】中的字段【${showFieldName}】（${targetFieldId}）`
            : showFieldName
            ? `字段【${showFieldName}】（${targetFieldId}）`
            : `字段Key【${targetFieldId}】`;

        showNotify({ type: 'warning', message: fieldLabel + message });
      }
    }
  };

  const buildSignatureParams = (signResult) => {
    if (typeof signResult !== 'object') return {};
    const signature = toRaw(signResult.signature);

    return {
      opinion: signResult.comment,
      remark: signResult.memo,
      signature: !isEmpty(signature) ? JSON.stringify([signature]) : undefined,
      toUserId: signResult.person,
    };
  };

  const handleFormChangeApproval = async (btn, isAuto, signResult) => {
    const signatureParams = buildSignatureParams(signResult);

    const params = {
      ofInstanceId: props.paramExtraProps?._gct_form_change_process_btn?.ofInstanceId,
      businessId: props.paramExtraProps?._gct_change_business_id,
      btnKey: btn.type,
      taskId: props.paramExtraProps?._gct_form_change_process_btn?.taskId,
      buttonConfig: JSON.stringify({
        title: btn.customTitle,
        color: btn.style?.backgroundColor,
      }),
      ...signatureParams,
    };

    await btn.api(params);
  };

  const handleNormalButton = async (btn, isAuto, signResult, exceptionFlag) => {
    const uniqueId = basicIns.value?.uniqueId ?? '';
    const signatureParams = buildSignatureParams(signResult);

    const attachmentList = getAppendixInfos(uniqueId, formIns.value, [FIELD_TYPE.ATTACHMENT]);
    const formData = await getFormState(uniqueId);

    const baseParams: any = {
      data: { ...formData, __GCT_FOREIGN__: null },
      ofInstId: props.selfId,
      btnKey: btn.type,
      buttonConfig: JSON.stringify({
        title: btn.customTitle,
        color: btn.style?.backgroundColor,
      }),
      auto: isAuto,
      businessId: props?.paramExtraProps?._gct_nocode_business_id_,
      attachmentNumber: attachmentList?.length || 0,
      // pad端临时处理，不然保存不了
      checkEditUser: false,
      ...signatureParams,
    };

    // Submit 特殊逻辑
    if (btn.type === 'Submit' && btn.buttonType === 'builtin' && !isAuto) {
      baseParams.exceptionFlag = exceptionFlag; // 是否是异常表单提交
    }

    // 流程类表单特殊处理
    if (formIns.value?.formType === FormTypeEnum.PROCESS) {
      const processInfo = formIns.value?.ofProcessOperations ?? {};
      baseParams.taskId = processInfo.taskId;

      // 自定义按钮跳节点
      if (btn.buttonType === 'custom' && btn.isCustom) {
        baseParams.jumpMode = btn.flowAction;
      }
    }

    // 后端需要在请求头增加随机数
    const transferToConfig = {
      headers: {
        'Trace-Id': commonUtils.uuid2(32, 32),
      },
    };

    await btn.api(baseParams, { transferToConfig });
  };

  const requestInterfaceByButtonKey = async (btn: any, isAuto, signResult, exceptionFlag) => {
    if (typeof btn.api !== 'function') return;

    // 表单变更流程
    if (btn.belongFormChangeApproval) {
      return handleFormChangeApproval(btn, isAuto, signResult);
    }

    return handleNormalButton(btn, isAuto, signResult, exceptionFlag);
  };

  const handleBtnClick = async (btn: any) => {
    const uniqueId = basicIns.value?.uniqueId ?? '';
    const key = `${btn.type}_${btn.buttonType}`;
    // 防止重复点击
    if (loadingMap[key] || isAnyLoading.value) return;
    loadingMap[key] = true;
    let exceptionFlag = 0; // 表单是否异常 0:无异常,1:有异常

    try {
      if (typeof btn.api === 'function') {
        // 卡控逻辑
        if (btn.style && has(btn.style, 'controlType')) {
          // 判断卡控逻辑
          if (btn.style.controlType === CardControlEnum.CHECK2TIP) {
            try {
              // 尝试校验表单
              await validate(false, uniqueId, onNotifyTips);
            } catch (error) {
              // 如果校验失败，弹出提示框
              const userConfirmed = await new Promise((resolve) => {
                showConfirmDialog({
                  title: '提示',
                  message: btn?.style?.checkContent,
                })
                  .then(() => {
                    // 如果是提交按钮记录表单是否异常提交
                    if (btn.type === 'Submit' && btn.buttonType === 'builtin') {
                      exceptionFlag = 1;
                    }
                    resolve(true);
                  })
                  .catch(() => {
                    if (error.callback && typeof error.callback === 'function') {
                      error.callback();
                    }
                    resolve(false);
                  });
              });
              // 如果用户选择取消，则直接返回，不执行后续逻辑
              if (!userConfirmed) return;
            }
          } else if (btn.style.controlType === CardControlEnum.CHECK) {
            await validate(true, uniqueId, onNotifyTips);
          } else if (btn.style.controlType === CardControlEnum.NONE) {
            // 不卡控的话也需要进行记录
            if (btn.type === 'Submit' && btn.buttonType === 'builtin') {
              try {
                await validate(false, uniqueId, onNotifyTips);
              } catch {
                exceptionFlag = 1;
              }
            }
          }
        } else {
          if (!(btn.type === 'Save' && btn.buttonType === 'builtin')) {
            await validate(true, uniqueId, onNotifyTips);
          }
        }

        let signResult;
        if (btn.belongFormChangeApproval || formIns.value?.formType === FormTypeEnum.PROCESS) {
          signResult = await excApprovalOperate(btn);
        } else if ([FormTypeEnum.BASE, FormTypeEnum.FILE].includes(formIns.value?.formType)) {
          signResult = await excBaseButton(btn);
        }
        if (!signResult) return;
        await requestInterfaceByButtonKey(btn, false, signResult, exceptionFlag);
        showToast(t('sys.operationSuccess'));
      }

      // 重新提交需要重置表单状态
      // if (btn.type === ChangeType.Resubmit) {
      // await refreshData(() => RenderModeEnum.FormMode);
      // }

      // keep 为 true 时，且点击不是取消的时候不关闭，刷新数据
      if (props.keep && (btn.type !== 'Cancel' || !props.inDrawer)) {
        // 作废按钮有场景不需要刷新表单，直接隐藏掉的
        if (!btn.notNeedRefreshForm) {
          counter.value++;
        }
      }

      emit('btn-click-callback', btn);
    } finally {
      // 无论中途是否 return 或抛错，都会重置 loading 状态
      loadingMap[key] = false;
    }
  };

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

        showToast('数据自动保存成功!');
      } else {
        showToast('数据保存成功!');
      }
    }
  }

  /** 执行表单校验清单逻辑 */
  const doCheckList = async () => {
    console.log('doCheckList');
    const uniqueId = basicIns.value?.uniqueId ?? '';

    validate(false, uniqueId, onNotifyTips)
      .then((res) => {
        if (res && res.isValid) {
          showToast('字段填写内容校验通过！');
        }
      })
      .catch((error) => {
        if (error.callback && typeof error.callback === 'function') {
          error.callback({ showValidateCheckList: true });
        }
      });
  };

  /** 批注相关 */
  const annotationController = useMobileAnnotation({
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
    checkedEditFormByUser: async () => {
      // todo 待补充表单锁定相关逻辑
    },
    onVisibleChange: (visible) => {},
  });

  defineExpose({
    /** 按钮列表 */
    actionButtonList: actionButtonListWithLoading,
    basicBuiltinButtons,
    isShowFooter,
    handleBtnClick,
    formIns,
    basicIns,
    doCheckList,
    /** 设置自动保存 */
    quickSaveData,
    annotationController,
  });
</script>
