import { message, Modal } from 'ant-design-vue';
import {
  CategoryModuleEnum,
  ControlAction,
  EdhrVersionAction,
  FormVersionAction,
} from '../constant';
import { FormTypeEnum } from '@gct/nocode-base';
import { FormRelateDTO } from '/@/apis/gct-apaas/model';
import { ControlStatusEnum } from '/@app-designer/views/online-form/constants';
import { postOnlineFormProcessControl } from '/@/apis/gct-apaas/OnlineFormProcessController';
import { postEdhrTmplControl } from '/@/apis/gct-apaas/EdhrTmplController';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { postDocControlProcessInterfereReturn } from '/@/apis/gct-apaas/DocControlProcessController';
import DocControlBpmnRuntime from '/@/components/BpmnRuntime/doc-control/index.vue';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import { useConfirmAction } from './useConfirmAction';

/** 判断是否支持文控配置 */
export function isEnableDocControl(): boolean {
  const appInfoStore = useAppInfoStore();
  const isInEDHR =
    appInfoStore.appInfo.suiteKey === 'eDHR' || appInfoStore.appInfo.suiteKey === 'MEDPRO';
  // 非EHDR不支持
  if (!isInEDHR) {
    return false;
  }
  // EDHR应用看全局配置是否支持
  const { businessSetting } = useBusinessSetting();

  return !!businessSetting.enableDocControl;
}

function getTmpVersionId(row: FormRelateDTO): string {
  return `${row.baseId}:${row.id}`;
}

/**
 * 开启受控
 */
async function startControl(row: FormRelateDTO, module: CategoryModuleEnum, refresh: () => {}) {
  const { run } = useConfirmAction();

  const tmplId = getTmpVersionId(row);
  await run({
    id: tmplId,
    title: $t('sys.edhr.startControlTipTitle', {
      name: row.name,
      title: module === CategoryModuleEnum.EDHR ? 'DHR' : $t('sys.process.form'),
    }),
    content: $t('sys.edhr.startControlTipContent', {
      title: module === CategoryModuleEnum.EDHR ? 'DHR' : $t('sys.process.form'),
    }),
    action: async () => {
      if (module === CategoryModuleEnum.EDHR) return postEdhrTmplControl({ tmplId });
      return postOnlineFormProcessControl({ tmplId });
    },
    onSuccess: () => refresh(),
  });
}

/**
 * 撤回受控流程
 */
async function withdrawControl(row: FormRelateDTO, module: CategoryModuleEnum, refresh: () => {}) {
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
function openControlPathModal(row: FormRelateDTO) {
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

export function executeControlAction(
  row: FormRelateDTO,
  action: ControlAction,
  module: CategoryModuleEnum,
  refresh: () => {},
) {
  switch (action) {
    case ControlAction.CONTROL:
      startControl(row, module, refresh);
      break;
    case ControlAction.CONTROL_PATH:
      openControlPathModal(row);
      break;
    case ControlAction.WITHDRAW:
      withdrawControl(row, module, refresh);
      break;
  }
}

/** 判断是否显示Action */
export function isShowAction(action: any, row: FormRelateDTO): boolean {
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

  if (!enableDocControl) {
    // 非电子批记录里不显示所有文控相关的操作
    return !Object.values(ControlAction).includes(action);
  } else {
    if (!row.controlStatus || row.controlStatus === ControlStatusEnum.UNCONTROLLED) {
      return ![
        ControlAction.CONTROL_PATH,
        ControlAction.WITHDRAW,
        ControlAction.PROCESS_DESIGN,
        ControlAction.BUTTON_DESIGN,
        ...defaultActions,
      ].includes(action);
    } else if (row.controlStatus === ControlStatusEnum.RUNNING) {
      return ![
        ControlAction.CONTROL,
        ControlAction.PROCESS_DESIGN,
        ControlAction.BUTTON_DESIGN,
        ...updateActions,
        ...defaultActions,
      ].includes(action);
    } else if (row.controlStatus === ControlStatusEnum.CONTROLLED) {
      const filterActions: any =
        row.formType === FormTypeEnum.PROCESS
          ? [ControlAction.BUTTON_DESIGN]
          : row.formType === FormTypeEnum.BASE
            ? [ControlAction.PROCESS_DESIGN]
            : [ControlAction.BUTTON_DESIGN, ControlAction.PROCESS_DESIGN];

      // 受控状态编辑相关操作都不能执行
      return ![
        ControlAction.CONTROL,
        ControlAction.WITHDRAW,
        ...filterActions,
        ...updateActions,
      ].includes(action);
    }
    return true;
  }
}
