import { computed, inject, onBeforeMount, ref, Ref, watch } from 'vue';
import {
  OnlineFormChangeHistoryResponse,
  OnlineFormInstanceResponse,
} from '/@/apis/gct-apaas/model';
import { IBasicInfoItem } from '../../types';
import {
  EBR_PROVIDE_ENUM,
  FormTypeEnum,
  InstanceStatusValues,
  RenderModeEnum,
  SummaryApproveHisTypeEnum,
} from '../../constant';
import { useNocodeEmitter } from '../useNocodeEmitter';
import { BuiltinAction, ChangeType } from './types';
import { isEmpty } from 'lodash-es';
import { getBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
import { getOnlineFormChangeHistoryList } from '/@/apis/gct-apaas/OnlineFormChangeHistoryController';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { uuid2 } from '../../_utils_';
import {
  postOnlineFormProcessResubmitOf,
  postOnlineFormProcessChange,
} from '/@/apis/gct-apaas/OnlineFormProcessController';
import { postOnlineFormBaseSubmit } from '/@/apis/gct-apaas/OnlineFormBaseController';
import { postOnlineFormInstanceDataCollectionAbandon } from '/@/apis/gct-apaas/MedProFormInstanceController';
import { MaterialStatusEnum } from '@gct/nocode-base';

export interface IFormAnnotationControllerConstructParams {
  /** 在线表单实例详情 */
  formIns: Ref<OnlineFormInstanceResponse>;
  /** 当前页面基础信息 */
  basicIns: Ref<IBasicInfoItem | undefined>;
  /** 是否需要作废按钮 */
  needAbandonBtn: boolean;
  /** 页面操作对象 */
  formRef: any;
  /** 参数扩展属性 */
  paramExtraProps: any;
  /** 数据采集信息 */
  dataCollectionInfo: any;
  /** 按钮点击事件 */
  onBtnClick: (btn) => void;
  /** 批注显隐事件 */
  onVisibleChange: (visible: boolean) => void;
  /**验证表单是否可以编辑 */
  checkedEditFormByUser?: () => Promise<void>;
}

/**
 * 表单作废批注等公用逻辑处理
 * @export
 * @class FormAnnotationController
 */
export abstract class FormAnnotationController implements IFormAnnotationControllerConstructParams {
  formIns!: Ref<OnlineFormInstanceResponse>;
  basicIns!: Ref<any>;
  needAbandonBtn!: boolean;
  formRef!: any;
  paramExtraProps!: any;
  dataCollectionInfo!: any;
  onBtnClick!: (btn: any) => void;
  onVisibleChange!: (visible: boolean) => void;
  checkedEditFormByUser?: (() => Promise<void>) | undefined;

  /**
   * 构造函数必须在setup里使用
   * @param params
   */
  constructor(params: IFormAnnotationControllerConstructParams) {
    Object.assign(this, params);
    this.showAnnotation.value = this.paramExtraProps?._gct_default_annotation_status_ || false;

    // 按钮权限控制权限赋值
    this.roleBuiltinBtnPermission = inject(
      EBR_PROVIDE_ENUM.EDHR_BUTTON_PERMISSION,
      this.roleBuiltinBtnPermission,
    );

    const { emitter, EmitterEnum } = useNocodeEmitter();

    onBeforeMount(() => {
      // 打开单个批注详情
      emitter.on(EmitterEnum.__on__open_single_annotation_detail_, (params: any) => {
        console.log('打开单个批注详情 aaaa', params);
        this.selectedCell.value = params.cellLocation;
      });
    });

    watch(
      [this.ready, this.showAnnotation],
      async ([isReady, visible]) => {
        if (!isReady) {
          return;
        }

        if (!this.showButtonKeys.value.includes('annotate-button')) {
          return;
        }

        const uniqueId = this.basicIns.value?.uniqueId ?? '';

        if (!visible) {
          this.selectedCell.value = undefined;
          await this.formRef.setAnnotationViewStatus(uniqueId, false, []);

          return;
        }

        const defaultAnnotationStatus = !!this.paramExtraProps?._gct_default_annotation_status_;
        if (defaultAnnotationStatus) {
          await this.fetchApprovalFormChangeHistory();
        } else {
          await this.fetchAllFormChangeHistory();
        }

        await this.formRef.setAnnotationViewStatus(uniqueId, true, this.allCellLocation.value);
      },
      {
        immediate: true,
      },
    );
  }

  /** 内置按钮权限控制 */
  roleBuiltinBtnPermission = ref({
    Annotate: false,
    Cancel: false,
    Update: false,
    _gct_summary_approve_type_: '',
  });

  /** 当前登录的用户名 */
  userName!: string;

  //! 批注相关变量
  /** 正在标注 */
  showAnnotation = ref(false);
  /** 所有的父级批注数据 */
  annotationList = ref<OnlineFormChangeHistoryResponse[]>([]);
  /** 所有的修改过的单元格位置 */
  allCellLocation = ref<string[]>();
  /** 是否已经加载过批注数据 */
  hasLoadedHistory = ref(false);

  //! 变更相关变量
  /** 正在进行表单变更 */
  formChanging = ref(false);
  /** 表单变更原因 */
  formChangeReason = ref<string | undefined>();

  /** 选中单元格的位置 */
  selectedCell = ref<string>();

  //! 表单相关变量
  /** 单据名称 */
  docName = computed(() => {
    return `【${this.formIns.value.tmplName}】`;
  });

  /** 表单是否是结束状态 */
  isFormEnded = computed(() => {
    const { formType, dataStatus, instanceStatus } = this.formIns.value;
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
  isFormDeprecated = computed(() => {
    const { instanceStatus } = this.formIns.value;
    return instanceStatus === InstanceStatusValues.ABANDON;
  });

  /** 表单是否是变更审核中状态 */
  isFormInAudit = computed(() => {
    const { instanceStatus } = this.formIns.value;
    return instanceStatus === InstanceStatusValues.IN_AUDIT;
  });

  /** 表单是否是未填报、暂存、进行中的状态 */
  isFormUnfilled = computed(() => {
    const { instanceStatus } = this.formIns.value;
    return (
      InstanceStatusValues.UNFILLED === instanceStatus ||
      InstanceStatusValues.RUNNING === instanceStatus ||
      InstanceStatusValues.STASH === instanceStatus
    );
  });

  /** 显示内置按钮 */
  showButtonKeys = computed(() => {
    // 必须是表单结束状态并且是支持显示内置按钮
    const buttonKeys: string[] = [];
    const { Annotate, Cancel, Update } = this.roleBuiltinBtnPermission.value;

    const isBaseOrProcessOrFile =
      this.formIns.value.formType === FormTypeEnum.BASE ||
      this.formIns.value.formType === FormTypeEnum.PROCESS ||
      this.formIns.value.formType === FormTypeEnum.FILE;

    // 批注、变更记录（批注）按钮逻辑
    if (
      (this.isFormEnded.value || this.isFormInAudit.value) &&
      (Annotate || this.paramExtraProps?._gct_is_form_change_approval_page_) &&
      !this.formChanging.value &&
      isBaseOrProcessOrFile
    ) {
      buttonKeys.push('annotate-button');
    }

    const shouldShowAbandon = !this.showAnnotation.value && isBaseOrProcessOrFile;

    // 重新提交、表单作废按钮
    // 如果在数据变更页面，那么还是需要表单结束状态才显示
    if (Cancel) {
      if (
        this.isFormEnded.value &&
        !this.showAnnotation.value &&
        this.formIns.value.businessType !== MaterialStatusEnum.PRODUCT_RELEASE
      ) {
        buttonKeys.push(this.isFormDeprecated.value ? 'resubmit-button' : 'abandon-button');
      }
    } else if (
      this.needAbandonBtn &&
      this.formIns.value.edhrInstanceId &&
      this.isFormUnfilled.value &&
      this.basicIns.value?.btnRenderModeType === RenderModeEnum.FormMode &&
      shouldShowAbandon
      //  ||(shouldShowAbandon &&
      //   !this.isFormInAudit.value &&
      //   this.paramExtraProps?._gct_is_form_dhr_release_page_ &&
      //   this.formIns.value.instanceStatus !== 'COMPLETED')
    ) {
      //1.如果不在数据变更页面，那么只有eDHR并且表单是未填报状态才显示
      //!@deprecated 2.【dhr/放行页面】表单不是变更中增加作废按钮
      buttonKeys.push('abandon-button');
    }

    // 提交变更、表单变更按钮逻辑
    if (
      this.isFormEnded.value &&
      Update &&
      !this.showAnnotation.value &&
      !this.isFormDeprecated.value
    ) {
      buttonKeys.push('modify-button');
    }

    if (
      !!this.dataCollectionInfo &&
      this.isFormUnfilled.value &&
      this.basicIns.value?.btnRenderModeType === RenderModeEnum.FormMode
    ) {
      buttonKeys.push('medpro-abandon-button');
    }

    return buttonKeys;
  });

  /**
   * 获取后台接口的参数
   */
  getBackendParams = async () => {
    const uniqueId = this.basicIns.value?.uniqueId ?? '';
    const formData = await this.formRef.getFormState(uniqueId);
    const data = { ...formData, __GCT_FOREIGN__: null };
    const taskId = this.formIns.value.ofProcessOperations?.taskId;
    return {
      data: data,
      ofInstId: this.formIns.value.id!,
      taskId: taskId,
    };
  };

  // 后端需要在请求头增加随机数
  getExConfig() {
    return {
      transferToConfig: {
        headers: {
          'Trace-Id': uuid2(32, 32),
        },
      },
    };
  }

  normalizeApprovalResponse = (res: any) => {
    if (!res) return [];
    return (res ?? []).map((item: any) => {
      const params = JSON.parse(item.params_ || '{}');
      return {
        id: item.id_,
        changeNo: item.change_no_,
        isCurrentChange: item.change_no_ === this.paramExtraProps?._gct_change_business_code_,
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

  normalizeAllResponse = (res: any) => {
    if (!res) return [];
    return Array.isArray(res) ? res : (res.data ?? []);
  };

  applyAnnotationItems = (items: any[], callback) => {
    this.annotationList.value = items || [];

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

    this.allCellLocation.value = Array.from(cellLocationSet);
    console.log('annotationList applied, allCellLocation:', this.allCellLocation.value);
  };

  /** 加载审批的批注信息 */
  fetchApprovalFormChangeHistory = async () => {
    if (isEmpty(this.formIns.value)) {
      throw new Error($t('sys.onlineForm.formInstanceIsEmpty'));
    }
    try {
      const res = await getBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_edhr_summary_approve_his',
          bsKey: 'list',
        },
        {
          onlineFormInstanceId: this.formIns.value.id!,
        },
      );

      const items = this.normalizeApprovalResponse(res);
      this.applyAnnotationItems(items, (item) =>
        this.paramExtraProps?._gct_form_change_approval_handle_ ? item.isCurrentChange : true,
      );
      // hasLoadedApprovalHistory.value = true;
      return items;
    } catch (e) {
      console.error('加载审批的批注信息 error', e);
      throw e;
    }
  };

  /** 加载所有批注信息 */
  fetchAllFormChangeHistory = async () => {
    if (isEmpty(this.formIns.value)) {
      throw new Error($t('sys.onlineForm.formInstanceIsEmpty'));
    }
    try {
      const res = await getOnlineFormChangeHistoryList({
        instanceId: this.formIns.value.id!,
        tmplId: this.formIns.value.tmplId!,
      } as any);

      const items = this.normalizeAllResponse(res);
      this.applyAnnotationItems(items, () => true);
      // hasLoadedAllHistory.value = true;
      return items;
    } catch (e) {
      console.error('加载所有批注信息 error', e);
      throw e;
    }
  };

  /** 开启批注 */
  handleOpenAnnotation = async () => {
    this.showAnnotation.value = true;

    if (this.onVisibleChange && typeof this.onVisibleChange === 'function') {
      this.onVisibleChange(false);
    }
  };

  /** 关闭批注 */
  handleCloseAnnotation = async () => {
    this.showAnnotation.value = false;
    this.selectedCell.value = undefined;
  };

  ready = computed(() => {
    return this.basicIns.value && this.basicIns.value.uniqueId;
  });

  /**
   * 弹出提示警告信息
   */
  abstract warn(message: string);

  /** 弹出提示信息 */
  abstract info(message: string);

  /** 确认提示 */
  abstract confirm(opts: { title; onOk; onCancel });

  /** 打开表单废弃操作弹窗V2版本 */
  abstract openFormAbandonV2Modal(opts?: {
    isFormChange: boolean;
  }): Promise<{ reason; applicant; reviewer; approveTmplId } | void>;

  /** 打开表单废弃操作弹窗 */
  abstract openFormAbandonModal(): Promise<{ reason; applicant; reviewer } | void>;
  /**
   *medPro 专门表单变更
   *
   * @abstract
   * @type {(Promise<{ reason; applicant; reviewer } | void>)}
   * @memberof FormAnnotationController
   */
  abstract openFormAbandonMedProModal(): Promise<{ reason; applicant; reviewer } | void>;
  /**
   * 点击表单废弃后续逻辑
   */
  doFormAbandon = async () => {
    if (
      this.formIns.value.formType === FormTypeEnum.TEXT ||
      this.formIns.value.formType === FormTypeEnum.VIEW
    ) {
      this.warn(`${$t(`sys.onlineForm.formTypeEnum.${this.formIns.value.formType}`)}不能作废`);
      return;
    }

    const res = await this.openFormAbandonV2Modal();
    if (!res) return;
    const { reason, applicant, reviewer, approveTmplId } = res;

    console.log('确认废弃', reason, reviewer, applicant, approveTmplId);
    const { ofInstId, taskId } = await this.getBackendParams();

    let summaryApproveHisType;
    let notebookId;
    // 如果在数据变更页面
    if (this.roleBuiltinBtnPermission.value.Cancel) {
      summaryApproveHisType = this.roleBuiltinBtnPermission.value._gct_summary_approve_type_; // 变更类型
      if (summaryApproveHisType === SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE) {
        notebookId = this.paramExtraProps?._gct_record_id; // 记录本 id
      }
    } else {
      // 如果不在数据变更页面，那么只有eDHR才显示表单作废按钮
      summaryApproveHisType = SummaryApproveHisTypeEnum.DHR_CHANGE;
      // 如果是放行页面，那么只能是表单变更
      if (this.paramExtraProps?._gct_is_form_dhr_release_page_) {
        summaryApproveHisType = SummaryApproveHisTypeEnum.FORM_CHANGE;
      }
    }
    // === 构造请求参数 ===
    const requestParams = {
      ofInstId,
      taskId,
      formType: this.formIns.value.formType!,
      btnKey: ChangeType.Abandon,
      reason,
      signHistoryIds: [applicant.historyId],
      change: this.roleBuiltinBtnPermission.value.Cancel,
      buttonConfig: JSON.stringify({
        title: $t('sys.onlineForm.AnnotationChangeType.Abandon'),
        color: '#ff7875',
      }),
      approveTmplId, // 审批模板ID
      summaryApproveHisType,
      ...(notebookId ? { notebookId } : {}),
      edhrInstId: this.formIns.value.edhrInstanceId,
    };

    await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_form_tmpl',
        bsKey: 'submit_abandon',
      },
      requestParams,
      {},
      this.getExConfig(),
    );

    // 如果eDHR目录里【表单输入属性】勾选了“是否需要填报”，此时作废时给出提示
    if (this.formIns.value.ofRequired) {
      const { Cancel } = this.roleBuiltinBtnPermission.value;
      // 如果在数据变更页面 直接从将作废时表单实例里获取
      let param;
      if (Cancel) {
        param = {
          businessId: this.formIns.value.businessId,
          businessType: this.formIns.value.ext1 === 'rework' ? 'REWORK' : 'DHR',
          ext1: this.formIns.value.ext1,
        };
      } else {
        const ext1 = this.paramExtraProps?._gct_nocode_ext1_ ?? 'production'; // 根据实际场景传production或rework 默认传production
        param = {
          businessId: this.paramExtraProps?._gct_nocode_business_id_, // 当前工序节点id
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
          ofTmplId: this.formIns.value.tmplId, // 判断是否需要创建实例只需要模版的父节点
          edhrInstanceId: this.formIns.value.edhrInstanceId!, // edhr实例id
          ignoreAbandon: true,
          pageNo: 1,
          pageSize: 20,
          ...param,
        },
      );
      // false 表示不需要新增 true 表示需要新增

      if (res) {
        this.info(
          $t('sys.onlineForm.thisFormIsRequiredAnInstanceHasBeenAutomaticallyCreatedForYou'),
        );
        await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: EntityModelCategoryEnum.ENTITY,
            modelKey: 'gct_edhr_instance',
            bsKey: 'insertFormInstance',
          },
          {
            docOutlineId: this.formIns.value.docOutlineId!,
            edhrInstanceId: this.formIns.value.edhrInstanceId!, // edhr实例id
            tmplId: this.formIns.value.tmplId!,
            description: $t('sys.onlineForm.initializeInstance'),
            ...param,
          },
        );
      }
    }

    this.onBtnClick({
      type: 'Cancel',
      title: $t('sys.cancelText'),
      notNeedRefreshForm: false, // 之前点击作废是直接会隐藏掉，所以不需要刷新，现在会走流程了，所以要主动刷新
    });
  };

  /**
   * 点击重新提交后续逻辑
   */
  doFormResubmit = async () => {
    console.log('重新提报');
    this.confirm({
      title: $t('sys.onlineForm.confirmResubmit'),
      onOk: async () => {
        const { ofInstId, taskId } = await this.getBackendParams();
        await postOnlineFormProcessResubmitOf(
          {
            ofInstId,
            taskId,
            formType: this.formIns.value.formType!,
            btnKey: ChangeType.Resubmit,
            buttonConfig: JSON.stringify({
              title: $t('sys.onlineForm.AnnotationChangeType.Resubmit'),
              color: 'var(--ant-primary-color)',
            }),
          },
          this.getExConfig(),
        );

        this.showAnnotation.value = false;
        // 外部按钮事件调用
        this.onBtnClick({
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
  doFormChange = async () => {
    if (
      this.formIns.value.formType === FormTypeEnum.TEXT ||
      this.formIns.value.formType === FormTypeEnum.VIEW
    ) {
      this.warn(`${$t(`sys.onlineForm.formTypeEnum.${this.formIns.value.formType}`)}不能变更`);
      return;
    }
    this.checkedEditFormByUser && (await this.checkedEditFormByUser());
    // 点击表单变更，直接进入表单编辑页面
    this.formChanging.value = true;
    const uniqueId = this.basicIns.value?.uniqueId ?? '';
    this.formRef.setFromEditStatus(uniqueId);
  };

  /**
   * 提交表单变更
   */
  submitFormChange = async () => {
    const res = await this.openFormAbandonV2Modal({ isFormChange: true });
    if (!res) return;
    const { reason, applicant, reviewer, approveTmplId } = res;

    console.log('提交表单变更', reason, reviewer, applicant, approveTmplId);
    const uniqueId = this.basicIns.value?.uniqueId ?? '';
    // 拿到所有变更数据
    const details = await this.formRef.getAnnotationContentList(uniqueId, {});
    // 表单变更按钮
    const { data, ofInstId, taskId } = await this.getBackendParams();
    const form = this.formIns.value!;
    const applicantHist = applicant?.historyId;

    let summaryApproveHisType;
    let notebookId;
    // 如果在数据变更页面
    if (this.roleBuiltinBtnPermission.value.Cancel) {
      summaryApproveHisType = this.roleBuiltinBtnPermission.value._gct_summary_approve_type_; // 变更类型
      if (summaryApproveHisType === SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE) {
        notebookId = this.paramExtraProps?._gct_record_id; // 记录本 id
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
      this.getExConfig(),
    );

    this.formChanging.value = false;
    this.onBtnClick({ type: 'Cancel', title: $t('sys.cancelText') });
  };
  /**
   * medpro表单提交变更
   */
  doMedProSubmitFormChange = async () => {
    const res = await this.openFormAbandonMedProModal();
    if (!res) return;
    const { reason, applicant, reviewer } = res;
    console.log('medpro表单提交变更', res);
    const uniqueId = this.basicIns.value?.uniqueId ?? '';
    // 拿到所有变更数据
    const details = await this.formRef.getAnnotationContentList(uniqueId, {});
    const form = this.formIns.value!;
    // 表单变更批注记录
    const historyInsertBatchRequest = {
      changeType: ChangeType.Form,
      details: details,
      instanceId: form.id!,
      reason,
      tmplId: form.tmplId!,
      signHistoryIds: [applicant.historyId, reviewer.historyId],
    };
    const { data, ofInstId, taskId } = await this.getBackendParams();
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
    this.getExConfig();
    this.formChanging.value = false;
    this.onBtnClick({ type: 'Cancel', title: $t('sys.cancelText') });
  };
  /**
   * medpro表单废弃
   */
  doMedproFormAbandon = async () => {
    console.log(this.dataCollectionInfo);
    if (
      this.formIns.value.formType === FormTypeEnum.TEXT ||
      this.formIns.value.formType === FormTypeEnum.VIEW
    ) {
      this.warn(`${$t(`sys.onlineForm.formTypeEnum.${this.formIns.value.formType}`)}不能作废`);
      return;
    }

    const res = await this.openFormAbandonModal();
    if (!res) return;
    const { reason, applicant, reviewer } = res;
    const obj = await this.getBackendParams();
    await postOnlineFormInstanceDataCollectionAbandon(
      {
        id: obj.ofInstId,
        reason: reason,
        signHistoryIds: [applicant.historyId, reviewer.historyId],
        taskId: this.dataCollectionInfo.id,
      },
      this.getExConfig(),
    );

    this.onBtnClick({
      type: 'Cancel',
      title: $t('sys.cancelText'),
      notNeedRefreshForm: !this.roleBuiltinBtnPermission.value.Cancel,
    });
  };

  /** 处理内置按钮 */
  handleBuiltAction = async (action: BuiltinAction) => {
    switch (action) {
      case BuiltinAction.CloseAnnotation:
        this.handleCloseAnnotation();
        break;
      case BuiltinAction.ShowAnnotation:
        this.handleOpenAnnotation();
        break;
      case BuiltinAction.DoFormChange:
        this.doFormChange();
        break;
      case BuiltinAction.SubmitFormChange:
        this.submitFormChange();
        break;
      case BuiltinAction.SubmitMedProFormChange:
        this.doMedProSubmitFormChange();
        break;
      case BuiltinAction.DoFormAbandon:
        this.doFormAbandon();
        break;
      case BuiltinAction.DoFormResubmit:
        this.doFormResubmit();
        break;
      case BuiltinAction.DoMedProFormAbandon:
        this.doMedproFormAbandon();
        break;
    }
  };
  /**
   * 实例变化时候需要初始化状态
   */
  initState = () => {
    this.formChanging.value = false;
  };
}
