import { GctDialog } from '/@/utils/Dialog';
import { EntityModelCategoryEnum, type IModalData } from '@gct/runtime';
import FormAbandonModal from '/@online-form/views/integration/apaas_si/render/annotation/form-abandon-modal.vue';
import ReworkList from '/@web-render/render/Event/Modal/kit-edhr/rework-configuration/ReworkList.vue';
import ProcessConfiguration from '/@web-render/render/Event/Modal/kit-edhr/rework-configuration/ProcessConfiguration.vue';
import TxnSplit from '/@web-render/render/Event/Modal/kit-edhr/txn-split/TxnSplit.vue';
import LabelPrint from '/@web-render/render/Event/Modal/kit-edhr/label-print/label-print.vue';
import TxnSourceInfo from '/@web-render/render/Event/Modal/kit-edhr/txn-source-info/txn-source-info.vue';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import EditFormPermission from '/@online-form/views/integration/apaas_ebr/modal/edit-form-permission';
import {
  Design as DesignFullScreen,
  Process as ProcessDrawer,
} from '/@web-render/views/edhr-application/components/approval-process-temp/index';
import { openApprovalSubjectInfoModal as openApprovalSubjectModalInfo } from '/@web-render/views/edhr-application/components/approval-process-temp/modal/composable/useApprovalHisInfo';
import FormOrderAdjustment from '/@/projects/page-designer/src/_kit/kit-eDHR/web/operation-config/dialog/form-order-adjustment.vue';
import { useFormEntriesReorder } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/operation-config/composable/useReorder';
import { ConfigType } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/temp-audit-process/enums';
import { EdhrDetailDrawer } from '/@/projects/online-form/src/views/web-render/edhr';
import EsopPreview from '/@online-form/components/esop/esop-preview.vue';
import { useFormVersion } from '/@/projects/online-form/src/views/web-render';
import { getEdhrTmplGetVersionById } from '/@/apis/gct-apaas/EdhrTmplController';
import { EOpeType } from '/@web-render/render/Event/Modal/kit-edhr/types';

/** eDHR 3.0.0.0 ⬇️⬇️⬇️⬇️⬇️ */
async function openSingleReworkModal(props) {
  const res: any = await gct.openUtil.drawer(
    ProcessConfiguration,
    {
      opeType: props.opeType || EOpeType.ADD,
      taskData: props.params,
      single: props.single || true,
    },
    {
      title: props.title || $t('sys.edhr.reworkConfiguration'),
      width: 1200,
      showFooter: false,
      class: 'rework-process-drawer',
    },
  );
  if (res && res.ok) {
    if (props && props.callback) {
      props.callback(res);
    }
  }
}
/**
 * 返工配置
 * @param props.title     弹框标题
 * @param props.single    是否单个配置
 * @param props.params    参数，符合 [IReworkModalParams] 接口定义
 * @param props.opeType   操作类型(EOpeType: add/edit/detail)和后端统一约束
 * @param props.callback  弹框关闭回调
 */
export async function openEdhrReworkProcessModal(props) {
  if (props && props.single) {
    openSingleReworkModal(props);
    return;
  }
  const res: any = await gct.openUtil.drawer(
    ReworkList,
    {
      isViewMode: props.opeType === EOpeType.DETAIL,
      data: props.params,
    },
    {
      title: props.title || $t('sys.edhr.reworkConfiguration'),
      width: 800,
      showFooter: false,
      class: 'rework-process-drawer',
    },
  );
  if (res && res.ok) {
    if (props && props.callback) {
      props.callback(res);
    }
  }
}

/**
 * 标签打印弹框
 * @param props 弹框参数
 * @param props.title     弹框标题
 * @param props.params    参数
 * @param props.txnInstId
 * @param props.printTmplId
 * @param props.templateType
 * @param props.printService
 * @param props.printNumber
 * @param props.callback  弹框关闭回调
 */
export async function openLabelPrintModal(props) {
  const res: any = await gct.openUtil.modal(
    LabelPrint,
    {
      data: props.params,
    },
    {
      title: props.title || $t('sys.pageDesigner.labelprint'),
      width: 800,
      showFooter: false,
    },
  );
  if (res && res.ok) {
    if (props && props.callback) {
      props.callback(res);
    }
  }
}

/**
 * 拆分配置弹框
 * @param props
 * @param props.title     弹框标题
 * @param props.params    参数 {container_id_: string, [key in string]: any]}
 * @param props.callback  弹框关闭回调
 */
export async function openEdhrTxnSplitModal(props) {
  const res: any = await gct.openUtil.drawer(
    TxnSplit,
    {
      data: props.params,
    },
    {
      title: props.title || '拆分',
      width: 800,
      showFooter: false,
      class: 'txn-split-drawer',
    },
  );
  if (res && res.ok) {
    if (props && props.callback) {
      props.callback(res);
    }
  }
}

/**
 * 双签名弹框
 * @param props
 * @param props.title 批次号
 * @param props.id    edhr实例id
 * @param props.singleSign  仅需要提交人签名（去除复核人签名需求）
 * @param props.callback  弹框关闭回调
 */
export async function openDoubleSignatureModal(props) {
  GctDialog.open(FormAbandonModal, {
    isFormChange: false,
    isShowTip: false,
    isDhr: true,
    docName: props.title,
    singleSign: props.singleSign || false,
    okCallback: async ({ reason, applicant, reviewer }) => {
      await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_edhr_summary_form_inst',
          bsKey: 'biz_abandon',
        },
        {
          edhrInstanceId: props.id,
          signHistoryIds: [applicant.historyId, reviewer.historyId],
          reason,
        },
      );

      props?.callback?.();
    },
  });
}

export function openFormTmplDetailModal(
  ofTmplId: string,
  payload?: { showEdit?: boolean; showMockBtn?: boolean },
) {
  const { openFormDetail } = useFormVersion();
  openFormDetail(ofTmplId, payload);
}

/**
 * 打开表单权限设置弹框
 * @param {string} formId 表单id
 * @param {{btnConfigs:string,fieldConfigs:string}} payload 表单权限配置
 * @returns {Promise<{btnConfigs:string,fieldConfigs:string}>}
 */
export async function openFormPermissionModal(
  formId: string,
  payload: {
    btnConfigs?: string;
    permissionConfigs?: string;
  },
) {
  if (!formId) return;
  const id = formId.includes(':') ? formId.split(':')[1] : formId;

  const res = await gct.openUtil.drawer<IModalData>(
    EditFormPermission,
    {
      id,
      payload: {
        btnConfigs: payload?.btnConfigs ? JSON.parse(payload.btnConfigs) : undefined,
        permissionConfigs: payload?.permissionConfigs
          ? JSON.parse(payload.permissionConfigs)
          : undefined,
      },
    },
    {
      width: 1200,
      title: $t('sys.pageDesigner.formConfigProp'),
      showFooter: true,
      class: 'gct-drawer edit-form-permission__modal',
    },
  );

  if (res?.ok) {
    return {
      btnConfigs: JSON.stringify(res.params?.btnConfigs || []),
      permissionConfigs: JSON.stringify(res.params?.permissionConfigs || []),
    };
  }
}

/**
 * 表单配置数据重排序
 * @param formData 包含 form_entries_ 的响应式数据对象
 * @param entriesKey form_entries_ 在 formData 中的键名，默认为 'form_entries_'
 * @returns
 */
export async function openFormEntriesSequenceAdjustmentModal(
  formData,
  entriesKey = 'form_entries_',
) {
  const { reorderFormEntriesInPlace } = useFormEntriesReorder(formData, entriesKey);

  try {
    const sortData = formData?.[entriesKey].map((item) => {
      return {
        id_: item.id_ || item._X_ROW_KEY,
        name_: item.name_,
        force_submit_: item.force_submit_,
        deleted_: item.deleted_,
      };
    });

    const res = await gct.openUtil.modal<IModalData>(
      FormOrderAdjustment,
      { sortData: sortData },
      { title: $t('sys.edhr.adjustmentOrder'), width: '600px' },
    );
    if (res.ok && res.params && res.params.data.length) {
      return reorderFormEntriesInPlace(res.params.data);
    }
  } catch (error) {
    console.error('Error opening sequence adjustment modal:', error);
  }
}

interface DesignModalProps {
  id: string;
  refId: string;
  name: string;
  detailMode?: boolean;
  configType: ConfigType;
  closed?: () => void;
}
async function openApprovalDesignModal(props: DesignModalProps) {
  const { id, closed } = props;
  const res: any = await gct.openUtil.fullScreen(DesignFullScreen, {
    id,
  });
  if (res.ok) {
    if (closed && typeof closed === 'function') closed();
  }
}

interface BizFlowPathModalProps {
  instId: string;
  processId: string;
  closed?: () => void;
}
async function openApprovalFlowPathModal(props: BizFlowPathModalProps) {
  const res: any = await gct.openUtil.drawer(
    ProcessDrawer,
    {
      ...props,
    },
    {
      title: $t('sys.edhr.flowPath'),
      width: 800,
      showFooter: false,
      class: 'biz-bpmn-runtime-drawer',
    },
  );
  if (res.ok) {
    if (props.closed && typeof props.closed === 'function') props.closed();
  }
}

export async function openApprovalFlowModal(props, instMode = false) {
  if (instMode) {
    openApprovalFlowPathModal(props);
  } else openApprovalDesignModal(props);
}

/**
 * 审核（表单、DHR、工艺、制程...）详情信息弹框
 * @param props
 */
export async function openApprovalSubjectInfoModal(props, subjectType, modalProps) {
  openApprovalSubjectModalInfo(props, subjectType, modalProps);
}

/**
 * 打开DHR模板详情框
 * @param props
 * @param props.ofTmplId DHR模板id
 * @param props.showEdit 是否展示编辑按钮
 */
export async function openDhrTemplateDetailModal(props) {
  const { ofTmplId, showEdit } = props;
  const info = await getEdhrTmplGetVersionById({ id: ofTmplId });
  if (!info) {
    throw new Error($t('sys.onlineForm.noData'));
  }

  await gct.openUtil.drawer(
    EdhrDetailDrawer,
    {
      data: info,
      showEdit,
    },
    {
      title: $t('sys.detail'),
      width: '70%',
      height: '100%',
    },
  );
}

/**
 * 查看sop文档
 * @param props
 * @param props.sopList sop文档列表
 */
export async function openSopDocumentModal(props) {
  const { sopList, hiddenBlank, defaultSelectedFile } = props;
  if (!sopList) return;

  await gct.openUtil.drawer(
    EsopPreview,
    {
      sopList,
      hiddenBlank: hiddenBlank ?? true,
      defaultSelectedFile,
    },
    {
      title: $t('SOP'),
      width: '70%',
      class: 'gct-ant-drawer',
    },
  );
}

export async function openTxnSourceInfoModal({ txnInstId }) {
  gct.openUtil.drawer(
    TxnSourceInfo,
    {
      txnInstId,
    },
    {
      title: $t('sys.edhr.transactionDetail'),
      width: 1200,
      showFooter: false,
      class: 'gct-ant-drawer',
    },
  );
}
