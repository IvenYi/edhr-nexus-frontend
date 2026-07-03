import { computed, onBeforeMount, Ref, ref, inject, watch } from 'vue';
import { getOnlineFormChangeHistoryList } from '/@/apis/gct-apaas/OnlineFormChangeHistoryController';
import {
  OnlineFormChangeHistoryResponse,
  OnlineFormInstanceResponse,
} from '/@/apis/gct-apaas/model';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { isEmpty } from 'lodash-es';
import { GctDialog } from '/@/utils/Dialog';
import FormAbandonV2Modal from './form-abandon-v2-modal.vue';
import FormAbandonModal from './form-abandon-modal.vue';
import { useUserStore } from '/@/store/modules/user';
import {
  SummaryApproveHisTypeEnum,
  FormTypeEnum,
  RenderModeEnum,
  useNocodeEmitter,
} from '@gct/nocode-base';
import {
  postOnlineFormProcessResubmitOf,
  postOnlineFormProcessChange,
} from '/@/apis/gct-apaas/OnlineFormProcessController';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postOnlineFormInstanceDataCollectionAbandon } from '/@/apis/gct-apaas/MedProFormInstanceController';
import { getBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
import { Modal, message } from 'ant-design-vue';
import { uuid2 } from '/@/utils/uuid';
import { InstanceStatusValues } from '../../../apaas_ebr/utils/instance-status';
import { postOnlineFormBaseSubmit } from '/@/apis/gct-apaas/OnlineFormBaseController';
import { EBR_PROVIDE_ENUM } from '/@online-form/views/integration/utils/enum';
import { BuiltinAction, type IBasicInfoItem } from '@gct/nocode-base';

export { BuiltinAction };

/** 后台提交类型 */
export enum ChangeType {
  Form = 'Form',
  Resubmit = 'Resubmit',
  Abandon = 'Abandon',
}

// 后端需要在请求头增加随机数
function getExConfig() {
  return {
    transferToConfig: {
      headers: {
        'Trace-Id': uuid2(32, 32),
      },
    },
  };
}

export function useAnnotation(opts: {
  formIns: Ref<OnlineFormInstanceResponse>;
  basicIns: Ref<IBasicInfoItem | undefined>;
  needAbandonBtn: boolean;
  formRef: any;
  paramExtraProps: any;
  dataCollectionInfo: any;
  onBtnClick: (btn) => void;
  onVisibleChange: (visible: boolean) => void;
  /**验证表单是否可以编辑 */
  checkedEditFormByUser?: () => Promise<void>;
}) {
  /** 内置按钮权限控制 */
  const roleBuiltinBtnPermission = inject<
    Ref<{
      Annotate: Boolean;
      Cancel: Boolean;
      Update: Boolean;
      _gct_summary_approve_type_: string;
    }>
  >(
    EBR_PROVIDE_ENUM.EDHR_BUTTON_PERMISSION,
    ref({
      Annotate: false,
      Cancel: false,
      Update: false,
      _gct_summary_approve_type_: '',
    }),
  );

  const { emitter, EmitterEnum } = useNocodeEmitter();
  const userStore = useUserStore();
  const userName = userStore.getUserInfo.fullname;

  const { formIns, basicIns, formRef } = opts;

  //! 表单相关变量
  /** 单据名称 */
  const docName = computed(() => {
    return `【${formIns.value.tmplName}】`;
  });

  /** 表单是否是结束状态 */
  const isFormEnded = computed(() => {
    const { formType, dataStatus, instanceStatus } = formIns.value;
    if (formType === FormTypeEnum.PROCESS) {
      return (
        instanceStatus === InstanceStatusValues.COMPLETED ||
        instanceStatus === InstanceStatusValues.ABANDON
      );
    } else {
      if (instanceStatus) {
        return (
          instanceStatus === InstanceStatusValues.COMPLETED ||
          instanceStatus === InstanceStatusValues.ABANDON
        );
      }
      return dataStatus === 'SUBMIT';
    }
  });

  /** 表单是否是废弃状态 */
  const isFormDeprecated = computed(() => {
    const { instanceStatus } = formIns.value;
    return instanceStatus === InstanceStatusValues.ABANDON;
  });

  /** 表单是否是变更审核中状态 */
  const isFormInAudit = computed(() => {
    const { instanceStatus } = formIns.value;
    return instanceStatus === InstanceStatusValues.IN_AUDIT;
  });

  /** 表单是否是未填报、暂存、进行中的状态 */
  const isFormUnfilled = computed(() => {
    const { instanceStatus } = formIns.value;
    return (
      InstanceStatusValues.UNFILLED === instanceStatus ||
      InstanceStatusValues.RUNNING === instanceStatus ||
      InstanceStatusValues.STASH === instanceStatus
    );
  });

  /** 显示内置按钮 */
  const showButtonKeys = computed(() => {
    // 必须是表单结束状态并且是支持显示内置按钮
    const buttonKeys: string[] = [];
    const { Annotate, Cancel, Update } = roleBuiltinBtnPermission.value;

    const isBaseOrProcessOrFile =
      formIns.value.formType === FormTypeEnum.BASE ||
      formIns.value.formType === FormTypeEnum.PROCESS ||
      formIns.value.formType === FormTypeEnum.FILE;

    // 批注、变更记录（批注）按钮逻辑
    if (
      (isFormEnded.value || isFormInAudit.value) &&
      (Annotate || opts.paramExtraProps?._gct_is_form_change_approval_page_) &&
      !formChanging.value &&
      isBaseOrProcessOrFile
    ) {
      buttonKeys.push('annotate-button');
    }

    const shouldShowAbandon = !showAnnotation.value && isBaseOrProcessOrFile;

    // 重新提交、表单作废按钮
    // 如果在数据变更页面，那么还是需要表单结束状态才显示
    if (Cancel) {
      if (isFormEnded.value && !showAnnotation.value) {
        buttonKeys.push(isFormDeprecated.value ? 'resubmit-button' : 'abandon-button');
      }
    } else if (
      opts.needAbandonBtn &&
      formIns.value.edhrInstanceId &&
      isFormUnfilled.value &&
      basicIns.value?.btnRenderModeType === RenderModeEnum.FormMode &&
      shouldShowAbandon
      //  ||(shouldShowAbandon &&
      //   !isFormInAudit.value &&
      //   opts.paramExtraProps?._gct_is_form_dhr_release_page_)
    ) {
      //1.如果不在数据变更页面，那么只有eDHR并且表单是未填报状态才显示
      //!@deprecated 2.【dhr/放行页面】表单不是变更中增加作废按钮
      buttonKeys.push('abandon-button');
    }

    // 提交变更、表单变更按钮逻辑
    if (isFormEnded.value && Update && !showAnnotation.value && !isFormDeprecated.value) {
      buttonKeys.push('modify-button');
    }

    if (
      !!opts.dataCollectionInfo &&
      isFormUnfilled.value &&
      basicIns.value?.btnRenderModeType === RenderModeEnum.FormMode
    ) {
      buttonKeys.push('medpro-abandon-button');
    }

    return buttonKeys;
  });

  /** 选中单元格的位置 */
  const selectedCell = ref<string>();
  const getBackendParams = async () => {
    const uniqueId = basicIns.value?.uniqueId ?? '';
    const formData = await formRef.getFormState(uniqueId);
    const data = { ...formData, __GCT_FOREIGN__: null };
    const taskId = formIns.value.ofProcessOperations?.taskId;
    return {
      data: data,
      ofInstId: formIns.value.id!,
      taskId: taskId,
    };
  };

  //! 批注相关变量
  /** 正在标注 */
  const showAnnotation = ref(opts.paramExtraProps?._gct_default_annotation_status_ || false);
  /** 所有的父级批注数据 */
  const annotationList = ref<OnlineFormChangeHistoryResponse[]>([]);
  /** 所有的修改过的单元格位置 */
  const allCellLocation = ref<string[]>();
  /** 是否已经加载过批注数据 */
  const hasLoadedHistory = ref(false);

  //! 变更相关变量
  /** 正在进行表单变更 */
  const formChanging = ref(false);
  /** 表单变更原因 */
  const formChangeReason = ref<string | undefined>();

  onBeforeMount(() => {
    // 打开单个批注详情
    emitter.on(EmitterEnum.__on__open_single_annotation_detail_, (params: any) => {
      console.log('打开单个批注详情 aaaa', params);
      selectedCell.value = params.cellLocation;
    });
  });

  const normalizeApprovalResponse = (res: any) => {
    if (!res) return [];
    return (res ?? []).map((item: any) => {
      const params = JSON.parse(item.params_ || '{}');
      return {
        id: item.id_,
        changeNo: item.change_no_,
        isCurrentChange: item.change_no_ === opts.paramExtraProps?._gct_change_business_code_,
        changeType: params?.historyRequest?.changeType || params.btnKey,
        avatar: item.avatar_,
        createUserName: item.create_user_name_,
        createTime: item.create_time_,
        reason: params?.historyRequest?.reason || params?.reason,
        signInfo: item.signInfo_,
        details: params?.historyRequest?.details,
        processId: item.approve_process_id_,
        processInstId: item.proc_inst_id_,
      };
    });
  };

  const normalizeAllResponse = (res: any) => {
    if (!res) return [];
    return Array.isArray(res) ? res : (res.data ?? []);
  };

  const applyAnnotationItems = (items: any[], callback) => {
    annotationList.value = items || [];

    // 计算所有的单元格位置
    const cellLocationSet = new Set<string>();
    items.forEach((item) => {
      if (item.changeType === ChangeType.Form && item.details?.length && callback?.(item)) {
        item.details.forEach((detail: any) => {
          const cellLocation = detail.cellLocation;
          if (cellLocation) cellLocationSet.add(cellLocation);
        });
      }
    });

    allCellLocation.value = Array.from(cellLocationSet);
    console.log('annotationList applied, allCellLocation:', allCellLocation.value);
  };

  /** 加载审批的批注信息 */
  const fetchApprovalFormChangeHistory = async () => {
    if (isEmpty(opts.formIns.value)) {
      throw new Error($t('sys.onlineForm.formInstanceIsEmpty'));
    }
    try {
      const res = await getBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_edhr_summary_approve_his',
          bsKey: 'list',
        },
        {
          onlineFormInstanceId: formIns.value.id!,
        },
      );

      const items = normalizeApprovalResponse(res);
      applyAnnotationItems(items, (item) =>
        opts.paramExtraProps?._gct_form_change_approval_handle_ ? item.isCurrentChange : true,
      );
      // hasLoadedApprovalHistory.value = true;
      return items;
    } catch (e) {
      console.error('加载审批的批注信息 error', e);
      throw e;
    }
  };

  /** 加载所有批注信息 */
  const fetchAllFormChangeHistory = async () => {
    if (isEmpty(opts.formIns.value)) {
      throw new Error($t('sys.onlineForm.formInstanceIsEmpty'));
    }
    try {
      const res = await getOnlineFormChangeHistoryList({
        instanceId: formIns.value.id!,
        tmplId: formIns.value.tmplId!,
      } as any);

      const items = normalizeAllResponse(res);
      applyAnnotationItems(items, () => true);
      // hasLoadedAllHistory.value = true;
      return items;
    } catch (e) {
      console.error('加载所有批注信息 error', e);
      throw e;
    }
  };

  /** 开启批注 */
  const handleOpenAnnotation = async () => {
    showAnnotation.value = true;

    if (opts.onVisibleChange && typeof opts.onVisibleChange === 'function') {
      opts.onVisibleChange(false);
    }
  };

  /** 关闭批注 */
  const handleCloseAnnotation = async () => {
    showAnnotation.value = false;
    selectedCell.value = undefined;
  };

  const ready = computed(() => {
    return basicIns.value && basicIns.value.uniqueId;
  });

  watch(
    [ready, showAnnotation],
    async ([isReady, visible]) => {
      if (!isReady) {
        return;
      }

      if (!showButtonKeys.value.includes('annotate-button')) {
        return;
      }

      const uniqueId = basicIns.value?.uniqueId ?? '';

      if (!visible) {
        selectedCell.value = undefined;
        await formRef.setAnnotationViewStatus(uniqueId, false, []);

        return;
      }

      const defaultAnnotationStatus = !!opts.paramExtraProps?._gct_default_annotation_status_;
      if (defaultAnnotationStatus) {
        await fetchApprovalFormChangeHistory();
      } else {
        await fetchAllFormChangeHistory();
      }

      await formRef.setAnnotationViewStatus(uniqueId, true, allCellLocation.value);
    },
    {
      immediate: true,
    },
  );

  /**
   * 点击表单废弃后续逻辑
   */
  const doFormAbandon = () => {
    if (
      formIns.value.formType === FormTypeEnum.TEXT ||
      formIns.value.formType === FormTypeEnum.VIEW
    ) {
      message.warn(`${$t(`sys.onlineForm.formTypeEnum.${formIns.value.formType}`)}不能作废`);
      return;
    }

    GctDialog.open(FormAbandonV2Modal, {
      docName: docName.value,
      okCallback: async ({ reason, applicant, reviewer, approveTmplId }) => {
        console.log('确认废弃', reason, reviewer, applicant, approveTmplId);
        const { ofInstId, taskId } = await getBackendParams();

        let summaryApproveHisType;
        let notebookId;
        // 如果在数据变更页面
        if (roleBuiltinBtnPermission.value.Cancel) {
          summaryApproveHisType = roleBuiltinBtnPermission.value._gct_summary_approve_type_; // 变更类型
          if (summaryApproveHisType === SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE) {
            notebookId = opts.paramExtraProps?._gct_record_id; // 记录本 id
          }
        } else {
          // 如果不在数据变更页面，那么只有eDHR才显示表单作废按钮
          summaryApproveHisType = SummaryApproveHisTypeEnum.DHR_CHANGE;
          // 如果是放行页面，那么只能是表单变更
          if (opts.paramExtraProps?._gct_is_form_dhr_release_page_) {
            summaryApproveHisType = SummaryApproveHisTypeEnum.FORM_CHANGE;
          }
        }
        // === 构造请求参数 ===
        const requestParams = {
          ofInstId,
          taskId,
          formType: formIns.value.formType!,
          btnKey: ChangeType.Abandon,
          reason,
          signHistoryIds: [applicant.historyId],
          change: roleBuiltinBtnPermission.value.Cancel,
          buttonConfig: JSON.stringify({
            title: $t('sys.onlineForm.AnnotationChangeType.Abandon'),
            color: '#ff7875',
          }),
          approveTmplId, // 审批模板ID
          summaryApproveHisType,
          ...(notebookId ? { notebookId } : {}),
          edhrInstId: formIns.value.edhrInstanceId,
        };

        await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: EntityModelCategoryEnum.ENTITY,
            modelKey: 'em_form_tmpl',
            bsKey: 'submit_abandon',
          },
          requestParams,
          {},
          getExConfig(),
        );

        // 如果eDHR目录里【表单输入属性】勾选了“是否需要填报”，此时作废时给出提示
        if (formIns.value.ofRequired) {
          const { Cancel } = roleBuiltinBtnPermission.value;
          // 如果在数据变更页面 直接从将作废时表单实例里获取
          let param;
          if (Cancel) {
            param = {
              businessId: formIns.value.businessId,
              businessType: formIns.value.ext1 === 'rework' ? 'REWORK' : 'DHR',
              ext1: formIns.value.ext1,
            };
          } else {
            const ext1 = opts?.paramExtraProps?._gct_nocode_ext1_ ?? 'production'; // 根据实际场景传production或rework 默认传production
            param = {
              businessId: opts?.paramExtraProps?._gct_nocode_business_id_, // 当前工序节点id
              businessType: ext1 === 'rework' ? 'REWORK' : 'DHR',
              ext1,
            };
          }

          const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
            {
              modelCategory: EntityModelCategoryEnum.ENTITY,
              modelKey: 'em_routing_operation_config',
              bsKey: 'biz_form_list',
            },
            {
              ofTmplId: formIns.value.tmplId, // 判断是否需要创建实例只需要模版的父节点
              edhrInstanceId: formIns.value.edhrInstanceId!, // edhr实例id
              ignoreAbandon: true,
              pageNo: 1,
              pageSize: 20,
              ...param,
            },
          );
          // false 表示不需要新增 true 表示需要新增

          if (res) {
            message.info(
              $t('sys.onlineForm.thisFormIsRequiredAnInstanceHasBeenAutomaticallyCreatedForYou'),
            );
            await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
              {
                modelCategory: EntityModelCategoryEnum.ENTITY,
                modelKey: 'gct_edhr_instance',
                bsKey: 'insertFormInstance',
              },
              {
                docOutlineId: formIns.value.docOutlineId!,
                edhrInstanceId: formIns.value.edhrInstanceId!, // edhr实例id
                tmplId: formIns.value.tmplId!,
                description: $t('sys.onlineForm.initializeInstance'),
                ...param,
              },
            );
          }
        }

        opts.onBtnClick({
          type: 'Cancel',
          title: $t('sys.cancelText'),
          notNeedRefreshForm: false, // 之前点击作废是直接会隐藏掉，所以不需要刷新，现在会走流程了，所以要主动刷新
        });
      },
    });
  };

  /**
   * 点击重新提交后续逻辑
   */
  const doFormResubmit = async () => {
    console.log('重新提报');
    Modal.confirm({
      title: $t('sys.onlineForm.confirmResubmit'),
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancelText'),
      onOk: async () => {
        const { ofInstId, taskId } = await getBackendParams();
        await postOnlineFormProcessResubmitOf(
          {
            ofInstId,
            taskId,
            formType: formIns.value.formType!,
            btnKey: ChangeType.Resubmit,
            buttonConfig: JSON.stringify({
              title: $t('sys.onlineForm.AnnotationChangeType.Resubmit'),
              color: 'var(--ant-primary-color)',
            }),
          },
          getExConfig(),
        );

        showAnnotation.value = false;
        // 外部按钮事件调用
        opts.onBtnClick({
          type: ChangeType.Resubmit,
          title: $t('sys.onlineForm.AnnotationChangeType.Resubmit'),
        });
      },
      onCancel: () => {},
    });
  };

  /**
   * 点击表单变更后续逻辑
   */
  const doFormChange = async () => {
    if (
      formIns.value.formType === FormTypeEnum.TEXT ||
      formIns.value.formType === FormTypeEnum.VIEW
    ) {
      message.warn(`${$t(`sys.onlineForm.formTypeEnum.${formIns.value.formType}`)}不能变更`);
      return;
    }
    opts.checkedEditFormByUser && (await opts.checkedEditFormByUser());
    // 点击表单变更，直接进入表单编辑页面
    formChanging.value = true;
    const uniqueId = basicIns.value?.uniqueId ?? '';
    formRef.setFromEditStatus(uniqueId);
  };

  /**
   * 提交表单变更
   */
  const submitFormChange = async () => {
    GctDialog.open(FormAbandonV2Modal, {
      docName: docName.value,
      isFormChange: true,
      okCallback: async ({ reason, applicant, reviewer, approveTmplId }) => {
        console.log('提交表单变更', reason, reviewer, applicant, approveTmplId);
        const uniqueId = basicIns.value?.uniqueId ?? '';
        // 拿到所有变更数据
        const details = await formRef.getAnnotationContentList(uniqueId, {});
        // 表单变更按钮
        const { data, ofInstId, taskId } = await getBackendParams();
        const form = formIns.value!;
        const applicantHist = applicant?.historyId;

        let summaryApproveHisType;
        let notebookId;
        // 如果在数据变更页面
        if (roleBuiltinBtnPermission.value.Cancel) {
          summaryApproveHisType = roleBuiltinBtnPermission.value._gct_summary_approve_type_; // 变更类型
          if (summaryApproveHisType === SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE) {
            notebookId = opts.paramExtraProps?._gct_record_id; // 记录本 id
          }
        } else {
          // 如果不在数据变更页面，那么只有eDHR才显示表单作废按钮
          summaryApproveHisType = SummaryApproveHisTypeEnum.DHR_CHANGE;
        }

        // 表单变更批注记录
        const historyInsertBatchRequest = {
          changeType: ChangeType.Form,
          details,
          instanceId: form.id!,
          reason,
          tmplId: form.tmplId!,
          signHistoryIds: [applicantHist].filter(Boolean),
        };

        const requestParams: any = {
          btnKey: ChangeType.Form,
          buttonConfig: JSON.stringify({
            title: $t('sys.onlineForm.AnnotationChangeType.Form'),
            color: 'var(--ant-primary-color)',
          }),
          data,
          historyRequest: historyInsertBatchRequest,
          ofInstId,
          opinion: reason,
          approveTmplId, // 审批模板ID
          summaryApproveHisType,
          ...(notebookId ? { notebookId } : {}),
          ...(form.formType === FormTypeEnum.PROCESS && taskId ? { taskId } : {}),
          edhrInstId: form.edhrInstanceId,
        };

        await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: EntityModelCategoryEnum.ENTITY,
            modelKey: 'em_form_tmpl',
            bsKey: 'submit_change',
          },
          requestParams,
          {},
          getExConfig(),
        );

        formChanging.value = false;
        opts.onBtnClick({ type: 'Cancel', title: $t('sys.cancelText') });
      },
    });
  };

  function openFormAbandonMedProModal(): Promise<{
    reason: any;
    applicant: any;
    reviewer: any;
  } | void> {
    const docName = `【${formIns.value?.ext2 ?? formIns.value.tmplName}】`;
    return new Promise((resolve, reject) => {
      GctDialog.open(FormAbandonMedProModal, {
        docName: docName,
        userName: userName,
        isShowTip: false,
        okCallback: async ({ reason, applicant, reviewer }) => {
          resolve({ reason, applicant, reviewer });
        },
        cancelCallback: () => {
          resolve();
        },
        options: {
          title: $t('sys.onlineForm.submitChange'),
        },
      });
    });
  }
  /**
   * medPro提交表单变更
   */
  const doMedProSubmitFormChange = async () => {
    const res = await openFormAbandonMedProModal();
    if (!res) return;
    const { reason, applicant, reviewer } = res;
    console.log('medpro表单提交变更', res);
    const uniqueId = basicIns.value?.uniqueId ?? '';
    // 拿到所有变更数据
    const details = await formRef.getAnnotationContentList(uniqueId, {});
    const form = formIns.value!;
    // 表单变更批注记录
    const historyInsertBatchRequest = {
      changeType: ChangeType.Form,
      details: details,
      instanceId: form.id!,
      reason,
      tmplId: form.tmplId!,
      signHistoryIds: [applicant.historyId, reviewer.historyId],
    };
    const { data, ofInstId, taskId } = await getBackendParams();
    const buttonConfig = JSON.stringify({
      title: $t('sys.onlineForm.AnnotationChangeType.Form'),
      color: 'var(--ant-primary-color)',
    });
    if (form.formType === FormTypeEnum.PROCESS) {
      // 流程表单调用的接口
      await postOnlineFormProcessChange({
        btnKey: ChangeType.Form,
        buttonConfig,
        data,
        historyRequest: historyInsertBatchRequest,
        ofInstId,
        opinion: reason,
        taskId: taskId!,
      });
    } else {
      // 非流程表单调用的接口
      await postOnlineFormBaseSubmit({
        buttonConfig,
        data,
        btnKey: ChangeType.Form,
        historyRequest: historyInsertBatchRequest,
        ofInstId,
        opinion: reason,
      });
    }
    getExConfig();
    formChanging.value = false;
    opts.onBtnClick({ type: 'Cancel', title: $t('sys.cancelText') });
  };
  /**
   * medpro表单废弃
   */
  const doMedproFormAbandon = async () => {
    console.log(opts.dataCollectionInfo);
    if (
      formIns.value.formType === FormTypeEnum.TEXT ||
      formIns.value.formType === FormTypeEnum.VIEW
    ) {
      message.warn(`${$t(`sys.onlineForm.formTypeEnum.${formIns.value.formType}`)}不能作废`);
      return;
    }

    const docName = `【${formIns.value?.ext2 ?? formIns.value.tmplName}】`;

    GctDialog.open(FormAbandonModal, {
      docName,
      userName: userName,
      isShowTip: roleBuiltinBtnPermission.value.Cancel,
      okCallback: async ({ reason, applicant, reviewer }) => {
        const obj = await getBackendParams();
        await postOnlineFormInstanceDataCollectionAbandon(
          {
            id: obj.ofInstId,
            reason: reason,
            signHistoryIds: [applicant.historyId, reviewer.historyId],
            taskId: opts.dataCollectionInfo.id,
          },
          getExConfig(),
        );

        opts.onBtnClick({
          type: 'Cancel',
          title: $t('sys.cancelText'),
          notNeedRefreshForm: !roleBuiltinBtnPermission.value.Cancel,
        });
      },
    });
  };

  /** 处理内置按钮 */
  const handleBuiltAction = async (action: BuiltinAction) => {
    switch (action) {
      case BuiltinAction.CloseAnnotation:
        handleCloseAnnotation();
        break;
      case BuiltinAction.ShowAnnotation:
        handleOpenAnnotation();
        break;
      case BuiltinAction.DoFormChange:
        doFormChange();
        break;
      case BuiltinAction.SubmitFormChange:
        submitFormChange();
        break;
      case BuiltinAction.SubmitMedProFormChange:
        doMedProSubmitFormChange();
        break;
      case BuiltinAction.DoFormAbandon:
        doFormAbandon();
        break;
      case BuiltinAction.DoFormResubmit:
        doFormResubmit();
        break;
      case BuiltinAction.DoMedProFormAbandon:
        doMedproFormAbandon();
        break;
    }
  };
  const initState = () => {
    formChanging.value = false;
  };
  return {
    initState,
    selectedCell,
    annotationList,
    isFormEnded,
    isFormDeprecated,
    showAnnotation,
    formChanging,
    showButtonKeys,
    handleBuiltAction,
  };
}
