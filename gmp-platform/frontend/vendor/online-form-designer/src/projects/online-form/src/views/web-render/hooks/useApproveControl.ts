import { message, Modal } from 'ant-design-vue';
import {
  CategoryModuleEnum,
  ApproveControlAction,
  EdhrVersionAction,
  FormVersionAction,
} from '../constant';
import { FormTypeEnum } from '@gct/nocode-base';
import { FormRelateDTO } from '/@/apis/gct-apaas/model';
import { ApprovalControlStatusEnum } from '/@app-designer/views/online-form/constants';
import { postOnlineFormProcessControl } from '/@/apis/gct-apaas/OnlineFormProcessController';
import { postEdhrTmplControl } from '/@/apis/gct-apaas/EdhrTmplController';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { postDocControlProcessInterfereReturn } from '/@/apis/gct-apaas/DocControlProcessController';
import DocControlBpmnRuntime from '/@/components/BpmnRuntime/doc-control/index.vue';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import {
  onOpenLaunchApprovalModal,
  ProcessType,
} from '/@/projects/page-designer/src/_kit/kit-eDHR/web/functional-unit/comps';
import {
  getDocControlStartedInfo,
  putDocControlStartedEffectiveDateById,
} from '/@/apis/gct-apaas/DocControlStartedController';

/** 判断是否支持文控配置 */
function isEnableDocControl(): boolean {
  const { businessSetting } = useBusinessSetting();

  return !!businessSetting.enableDocControl;
}

/**
 * 判断当前应用是否为eDHR
 * @returns
 */
export function isTrulyInEDHR() {
  const appInfoStore = useAppInfoStore();
  const isInEDHR = appInfoStore.appInfo.suiteKey === 'eDHR';
  return isInEDHR;
}

/** 判断是否支持审批配置 */
export function isEnableApproveControl(): boolean {
  const enableDocControl = isEnableDocControl();
  return enableDocControl && isTrulyInEDHR();
}

function getTmpVersionId(row: FormRelateDTO): string {
  return `${row.baseId}:${row.id}`;
}

/**
 * 审核
 */
async function launchApproval(row: FormRelateDTO, module: CategoryModuleEnum, refresh: () => {}) {
  const processType =
    module === CategoryModuleEnum.ONLINE_FORM ? ProcessType.ONLINE_FORM_TEMP : ProcessType.DHR_TEMP;
  const tmplId = getTmpVersionId(row);
  await onOpenLaunchApprovalModal({
    params: {
      processType,
      processId: row.id,
      subjectData: {
        ...row,
        id_: row.id,
        name_: row!.name! + ':' + row!.version,
      },
      customSubmit: async (params) => {
        console.log(params, 'params!!! 审核中...');
        if (module === CategoryModuleEnum.EDHR) {
          return await postEdhrTmplControl({ ...params, tmplId });
        }
        return await postOnlineFormProcessControl({ ...params, tmplId });
      },
    },
    callback: () => refresh(),
  });
}

/**
 * 撤回受控流程
 */
async function withdraw(row: FormRelateDTO, module: CategoryModuleEnum, refresh: () => {}) {
  Modal.confirm({
    title: $t('sys.edhr.confirmWithdraw'),
    async onOk() {
      const tmplId = getTmpVersionId(row);
      await postDocControlProcessInterfereReturn({ tmplId });
      message.success($t('sys.edhr.withdrawSuccess'));
      refresh();
    },
    onCancel() {},
  });
}
/**
 * 打开流程路径模态
 */
function openPathModal(row: FormRelateDTO) {
  gct.openUtil.modal(
    DocControlBpmnRuntime,
    {
      procInstId: row.procInstId,
    },
    {
      title: $t('sys.edhr.controlPath'),
      width: '80%',
      height: '80%',
      showFooter: false,
    },
  );
  console.log('tmplId', row.id);
}

/**
 *  设置生效日期
 * @param row
 * @param refresh
 */
async function setEffectiveDate(
  row: FormRelateDTO | any,
  module: CategoryModuleEnum,
  refresh: () => void,
) {
  const processType =
    module === CategoryModuleEnum.ONLINE_FORM ? ProcessType.ONLINE_FORM_TEMP : ProcessType.DHR_TEMP;
  await onOpenLaunchApprovalModal({
    modalProps: {
      title: $t('sys.edhr.processChoice.effectDate'),
    },
    params: {
      processType,
      processId: row.docControlStartedId,
      onlyEffect: true,
      subjectData: {
        ...row,
        id_: row.id,
        name_: row!.name! + ':' + row!.version,
      },
      customSubmit: async (params) => {
        return await putDocControlStartedEffectiveDateById(
          {
            id: row.docControlStartedId,
          },
          { effectiveDate: params.effectiveDate },
        );
      },
      customLoad: async () => {
        return await getDocControlStartedInfo({ id: row.docControlStartedId });
      },
    },
    callback: () => refresh(),
  });
}

export function executeApprovalControlAction(
  row: FormRelateDTO,
  action: ApproveControlAction,
  module: CategoryModuleEnum,
  refresh: () => {},
) {
  switch (action) {
    case ApproveControlAction.APPROVE:
      launchApproval(row, module, refresh);
      break;
    case ApproveControlAction.APPROVE_PATH:
      openPathModal(row);
      break;
    case ApproveControlAction.WITHDRAW:
      withdraw(row, module, refresh);
      break;
    case ApproveControlAction.EFFECT:
      setEffectiveDate(row, module, refresh);
      break;
    default:
      break;
  }
}

/** 判断是否显示Action */
export function isShowApprovalControlAction(action: any, row: FormRelateDTO | any): boolean {
  const enableDocControl = isEnableDocControl();
  const updateActions = [
    EdhrVersionAction.DESIGN_VERSION,
    EdhrVersionAction.EDIT_VERSION,
    EdhrVersionAction.DELETE_VERSION,
    FormVersionAction.DESIGN_VERSION,
    FormVersionAction.EDIT_VERSION,
    FormVersionAction.DELETE_VERSION,
  ];
  const defaultActions = [
    FormVersionAction.SET_DEFAULT_VERSION,
    EdhrVersionAction.SET_DEFAULT_VERSION,
  ];

  const filterActions: any =
    row.formType === FormTypeEnum.PROCESS
      ? [ApproveControlAction.BUTTON_DESIGN]
      : row.formType === FormTypeEnum.BASE
        ? [ApproveControlAction.PROCESS_DESIGN]
        : [ApproveControlAction.BUTTON_DESIGN, ApproveControlAction.PROCESS_DESIGN];

  if (!enableDocControl) {
    // 未开启审核功能（文控）
    return !Object.values(ApproveControlAction).includes(action);
  } else {
    // 开启审核功能（文控）
    if (!row.approveStatus || row.approveStatus === ApprovalControlStatusEnum.UN_AUDITED) {
      return ![
        ApproveControlAction.APPROVE_PATH,
        ApproveControlAction.WITHDRAW,
        ApproveControlAction.EFFECT,
        ApproveControlAction.PROCESS_DESIGN,
        ApproveControlAction.BUTTON_DESIGN,
        ...defaultActions,
      ].includes(action);
    }

    if (row.approveStatus === ApprovalControlStatusEnum.IN_AUDIT) {
      return ![
        ApproveControlAction.APPROVE,
        ApproveControlAction.EFFECT,
        ApproveControlAction.PROCESS_DESIGN,
        ApproveControlAction.BUTTON_DESIGN,
        ...updateActions,
        ...defaultActions,
      ].includes(action);
    }

    if (row!.approveStatus === ApprovalControlStatusEnum.WAIT_EFFECTIVE) {
      return ![
        ApproveControlAction.APPROVE,
        ApproveControlAction.WITHDRAW,
        ApproveControlAction.PROCESS_DESIGN,
        ApproveControlAction.BUTTON_DESIGN,
        ...updateActions,
        ...defaultActions,
      ].includes(action);
    }

    if (row.approveStatus === ApprovalControlStatusEnum.EFFECTIVE) {
      return ![
        ApproveControlAction.APPROVE,
        ApproveControlAction.WITHDRAW,
        ApproveControlAction.EFFECT,
        ...filterActions,
        ...updateActions,
      ].includes(action);
    }
    return true;
  }
}
