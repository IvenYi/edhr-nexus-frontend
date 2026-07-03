import { reactive, computed, toRaw } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { has, isEmpty } from 'lodash-es';
import { uuid2 } from '/@/utils/uuid';
import { ChangeType, FormTypeEnum, InstanceStatusValues } from '@gct/nocode-base';
import { CardControlEnum } from '@gct/runtime';
import { excBaseButton, excApprovalOperate } from '../../../approval';
import { IActionButtonItem } from '../apaas_si/render/types';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
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

export function useFormActionHandler(props, options) {
  const {
    formInfo,
    renderActionButton,
    getType,
    getAppendixInfos,
    getFormState,
    validate,
    updateCounter,
    onSuccess,
    isMedPro,
  } = options;

  const loadingMap = reactive({});

  // 当前是否有按钮正在 loading
  const isAnyLoading = computed(() => {
    return Object.values(loadingMap).some(Boolean);
  });

  const collapseInfo = computed(() => {
    return [
      {
        label: $t('sys.edhr.serialNo'),
        name: formInfo.value?.serialNo || '--',
      },
      {
        label: $t('sys.name'),
        name: formInfo.value?.tmplName || '--',
      },
      {
        label: $t('sys.no'),
        name: formInfo.value?.ofCode || '--',
      },
      {
        label: $t('sys.onlineForm.remarkName'),
        name: formInfo.value?.title || '--',
      },
      {
        label: $t('sys.status'),
        name: formInfo.value?.instanceStatus,
        render: 'status_render',
      },
      {
        label: $t('sys.edhr.relateLotSn'),
        name: formInfo.value?.relatedMaterialNo,
        useSlot: true,
        slotName: 'link_render_slot',
        slotData: {
          dhrInstanceList: formInfo.value?.edhrInstanceList,
        },
        // render: 'link_render',
        // ellipsis: true,
      },
      {
        label: $t('sys.createUser'),
        name: formInfo.value?.createUserName || '--',
      },
      {
        label: $t('sys.createTime'),
        name: formInfo.value?.createTime || '--',
      },
      {
        label: $t('sys.updatePerson'),
        name: formInfo.value?.modifyUserName || '--',
      },
      {
        label: $t('sys.edhr.complishTime'),
        name: formInfo.value?.completedTime || '--',
      },
    ];
  });

  // 当前操作按钮列表
  const actionButtonList = computed(() => {
    let showButtons, buttonConfig;
    const formType = formInfo.value?.formType as FormTypeEnum;

    if (props.paramExtraProps?._gct_is_form_change_approval_page_) {
      showButtons = props.paramExtraProps?._gct_form_change_process_btn?.showButtons || [];
      buttonConfig = props.paramExtraProps?._gct_form_change_process_btn?.buttonConfig || '';
    } else if (formType === FormTypeEnum.BASE || formType === FormTypeEnum.FILE) {
      buttonConfig = formInfo.value?.operation;
    } else if (formType === FormTypeEnum.PROCESS) {
      const processInfo = formInfo.value?.ofProcessOperations ?? {};
      const nodeDef = processInfo.nodeDef ?? {};
      // 作废审核中的表单，不可以做任何操作
      if (formInfo.value.instanceStatus !== InstanceStatusValues.IN_AUDIT) {
        showButtons = processInfo.buttons;
        buttonConfig = nodeDef.buttonConfig;
      }
    }

    const types = getType();

    let buttonList = renderActionButton(showButtons ?? [], buttonConfig ?? [], {
      formType,
      bpmnType: types.bpmnType!,
      modeType: types.modeType!,
      inDrawer: props.inDrawer,
      isViewPage: props.isViewPage,
      isRecordFill: props.isRecordFill,
      processOperation: formInfo.value?.processOperation,
      isFormChangeApprovalPage: props.paramExtraProps?._gct_is_form_change_approval_page_,
      isMedPro,
    });

    if (props.showRightBtns) {
      buttonList = buttonList.filter((i) => props.showRightBtns?.includes(i.type));
    }

    return buttonList;
  });

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
    const signatureParams = buildSignatureParams(signResult);

    const attachmentList = getAppendixInfos();
    const formData = await getFormState();

    const baseParams: any = {
      data: { ...formData, __GCT_FOREIGN__: null },
      ofInstId: props.selfId,
      btnKey: btn.type,
      buttonConfig: JSON.stringify({
        title: isAuto ? $t('sys.edhr.autoSave') : btn.customTitle,
        color: btn.style?.backgroundColor,
      }),
      auto: isAuto,
      businessId: props?.paramExtraProps?._gct_nocode_business_id_,
      attachmentNumber: attachmentList?.length || 0,
      ...signatureParams,
    };

    // Submit 特殊逻辑
    if (btn.type === 'Submit' && btn.buttonType === 'builtin' && !isAuto) {
      baseParams.exceptionFlag = exceptionFlag; // 是否是异常表单提交
    }

    // 流程类表单特殊处理
    if (formInfo.value?.formType === FormTypeEnum.PROCESS) {
      const processInfo = formInfo.value?.ofProcessOperations ?? {};
      baseParams.taskId = processInfo.taskId;

      // 自定义按钮跳节点
      if (btn.buttonType === 'custom' && btn.isCustom) {
        baseParams.jumpMode = btn.flowAction;
      }
    }

    // 后端需要在请求头增加随机数
    const transferToConfig = {
      headers: {
        'Trace-Id': uuid2(32, 32),
      },
    };

    await btn.api(baseParams, { transferToConfig });
  };

  const requestInterfaceByButtonKey = async (
    btn: IActionButtonItem,
    isAuto,
    signResult,
    exceptionFlag,
  ) => {
    if (typeof btn.api !== 'function') return;

    // 表单变更流程
    if (btn.belongFormChangeApproval) {
      return handleFormChangeApproval(btn, isAuto, signResult);
    }

    return handleNormalButton(btn, isAuto, signResult, exceptionFlag);
  };

  const handleBtnClick = async (btn: IActionButtonItem) => {
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
              await validate(false);
            } catch (error) {
              // 如果校验失败，弹出提示框
              const userConfirmed = await new Promise((resolve) => {
                Modal.confirm({
                  title: $t('sys.tip'),
                  content: btn?.style?.checkContent,
                  closable: false,
                  onOk: () => {
                    // 如果是提交按钮记录表单是否异常提交
                    if (btn.type === 'Submit' && btn.buttonType === 'builtin') {
                      exceptionFlag = 1;
                    }
                    resolve(true);
                  },
                  onCancel: () => {
                    error.callback?.();
                    resolve(false);
                  },
                });
              });
              // 如果用户选择取消，则直接返回，不执行后续逻辑
              if (!userConfirmed) return;
            }
          } else if (btn.style.controlType === CardControlEnum.CHECK) {
            await validate(true);
          } else if (btn.style.controlType === CardControlEnum.NONE) {
            // 不卡控的话也需要进行记录
            if (btn.type === 'Submit' && btn.buttonType === 'builtin') {
              try {
                await validate(false);
              } catch {
                exceptionFlag = 1;
              }
            }
          }
        } else {
          const isSaveBuiltin = btn?.type === 'Save' && btn?.buttonType === 'builtin'; // 内置保存按钮
          const skipValidate =
            isSaveBuiltin || btn?.belongFormChangeApproval || btn?.type === ButtonTypeEnum.Return;

          if (!skipValidate) {
            await validate(true);
          }
        }

        let signResult;
        if (btn.belongFormChangeApproval || formInfo.value?.formType === FormTypeEnum.PROCESS) {
          signResult = await excApprovalOperate(btn as any);
        } else if ([FormTypeEnum.BASE, FormTypeEnum.FILE].includes(formInfo.value?.formType)) {
          signResult = await excBaseButton(btn);
        }
        if (!signResult) return;
        await requestInterfaceByButtonKey(btn, false, signResult, exceptionFlag);
        message.success($t('sys.operationSuccess'));
      }

      // 重新提交需要重置表单状态
      if (btn.type === ChangeType.Resubmit) {
        // await refreshData(() => RenderModeEnum.FormMode);
      }

      // keep 为 true 时，且点击不是取消的时候不关闭，刷新数据
      if (props.keep && (btn.type !== 'Cancel' || !props.inDrawer)) {
        // 作废按钮有场景不需要刷新表单，直接隐藏掉的
        if (!btn.notNeedRefreshForm) {
          updateCounter();
        }
      }

      onSuccess(btn);
    } finally {
      // 无论中途是否 return 或抛错，都会重置 loading 状态
      loadingMap[key] = false;
    }
  };

  return {
    collapseInfo,
    actionButtonList,
    loadingMap,
    handleBtnClick,
    requestInterfaceByButtonKey,
  };
}
