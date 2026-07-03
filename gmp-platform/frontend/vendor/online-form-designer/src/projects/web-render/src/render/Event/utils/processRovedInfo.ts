import { ExamineAndApproveStateEnum, FormComponents } from '@gct/runtime';
import { approveButton } from '/@page-designer/types/web';
import { ButtonTypeEnum, OpinionTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
//我的已办
import {
  getPmProcessEngineModel,
  getPmProcessEngineTaskExtension,
  getPmProcessEngineHiTaskExtension,
  getPmProcessEngineInitialTaskExtension,
  getPmProcessEngineProcInstExtension,
} from '/@/apis/gct-apaas/PmProcessEngineController';
export { ExamineAndApproveStateEnum };
/**流程审批信息 */
export class ProcessAppRovedData {
  /**是否当前处理人 */
  isHandle: boolean = false;
  /**需要显示的审批按钮 */
  buttonConfig: ButtonConfig = {};
  /**字段信息 */
  fieldConfig: FieldConfig = {};
  /**流程id */
  processId: string = '';
  /**数据id */
  dataId: string = '';
  /**taskId */
  taskId: string;
  /**流程实例id */
  processInstanceId: string;
  /**模态框模式下绑定的流程表单id */
  refFormId?: string;
  /**审批状态 我发起的,我的代办,我的已办*/
  examineAndApproveState: ExamineAndApproveStateEnum = ExamineAndApproveStateEnum.MY_CUSTOM;
  fieldStatus: string = '';
  /**查看页面 */
  viewPageKey?: string;
  /**当前是否是查看页面 */
  isviewPage?: boolean;
  /**当前是否是APP查看页面 */
  isAPPviewPage?: boolean;
  /**非流程相关人 */
  nonRelatedPerson?: boolean = false;
  constructor({
    taskId,
    processInstanceId,
    examineAndApproveState = ExamineAndApproveStateEnum.MY_CUSTOM,
    refFormId,
  }) {
    this.taskId = taskId;
    this.processInstanceId = processInstanceId;
    this.examineAndApproveState = examineAndApproveState;
    this.refFormId = refFormId;
  }
  /**初始化流程信息 */
  async readyProcess() {
    const { taskId, processInstanceId } = this;
    //我的代办
    if (this.examineAndApproveState === ExamineAndApproveStateEnum.MY_AGENT) {
      await this.getDataInfo();
      const { node, processDefId, webViewPageKey, mobileViewPageKey } =
        await getPmProcessEngineTaskExtension({
          taskId,
        });
      this.transformByNode(node);
      this.processId = processDefId!;
      for (let k in this.buttonConfig) {
        /**我的*/
        if (k === ButtonTypeEnum.Withdraw) {
          this.buttonConfig[k]!.show = false;
        }
      }
      this.viewPageKey = node?.webViewPageKey || webViewPageKey;
      this.isAPPviewPage = node?.mobileViewPageKey || mobileViewPageKey;
    }
    //我发起的
    if (this.examineAndApproveState === ExamineAndApproveStateEnum.MY_APPLICATION) {
      await this.getDataInfo();
      //resubmitOp 显示重复提交，terminateOp显示终止，withdrawOp撤回
      const { node, processDefId, withdrawOp } =
        (await getPmProcessEngineInitialTaskExtension({ processInstanceId })) || {};
      this.transformByNode(node);
      this.processId = processDefId!;
      for (let k in this.buttonConfig) {
        if (k === ButtonTypeEnum.End) {
          this.buttonConfig[k]!.show = false;
        }
        if (k === ButtonTypeEnum.Withdraw) {
          this.buttonConfig[k]!.show = !!withdrawOp;
        }
        if (k === ButtonTypeEnum.Resubmit) {
          this.buttonConfig[k]!.show = false;
        }
      }
    }
    //我的已办
    if (this.examineAndApproveState === ExamineAndApproveStateEnum.MY_DONE) {
      await this.getDataInfo();
      const { node, processDefId } = await getPmProcessEngineHiTaskExtension({ taskId });
      this.transformByNode(node);
      this.processId = processDefId!;
    }

    //表格自定义审批
    if (this.examineAndApproveState === ExamineAndApproveStateEnum.MY_CUSTOM) {
      await this.getDataInfo();
      const { node, processDefId, btnList, webViewPageKey, taskId, initiatorNode } =
        await getPmProcessEngineProcInstExtension({
          procInstId: processInstanceId,
        });
      const btnkeys = btnList || [];
      this.withdrawByNode(initiatorNode);
      this.transformByNode(node);
      this.processId = processDefId!;
      for (let k in this.buttonConfig) {
        if (this.buttonConfig[k]!.show) {
          this.buttonConfig[k]!.show = btnkeys.includes(k);
        }
      }
      if (!node) {
        this.nonRelatedPerson = true;
        return;
      }
      if (!btnkeys.length || (node?.key === '__initiator__' && !taskId)) {
        this.isviewPage = true;
      } else {
        this.viewPageKey = node?.webViewPageKey || webViewPageKey;
      }
    }
    //表格自定义审批模态框
    if (this.examineAndApproveState === ExamineAndApproveStateEnum.MY_CUSTOM_Modal) {
      await this.getDataInfo();
      const { node, btnList, taskId, processDefId, initiatorNode } =
        await getPmProcessEngineProcInstExtension({
          procInstId: processInstanceId,
        });
      const btnkeys = btnList || [];
      this.withdrawByNode(initiatorNode);
      this.transformByNode(node);
      this.processId = processDefId!;
      for (let k in this.buttonConfig) {
        if (this.buttonConfig[k]!.show) {
          this.buttonConfig[k]!.show = btnkeys.includes(k);
        }
      }
      if (!node) {
        this.nonRelatedPerson = true;
        return;
      }
      if (!btnkeys.length || (node?.key === '__initiator__' && !taskId)) {
        this.isviewPage = true;
      }
    }
  }
  /**审批人，发起人 时候撤回按钮特殊逻辑 */
  withdrawByNode(node) {
    if (!node) return;
    const { buttonConfig } = node;
    const button = JSON.parse(buttonConfig);
    button.forEach((i) => {
      const actionTitle = $t(`sys.process.paasBpmnButtonEvent.${i.type}`);
      this.buttonConfig[i.type] = {
        showModel: false,
        title: $t('sys.process.element.approval') + actionTitle,
        success: actionTitle + $t('sys.success') + '!',
        show: i.enable,
        alias: i.alias,
        signature: !!i.signature,
        opinion: {},
        user: {},
      };
    });
  }
  /**节点按钮状态数据转化 */
  transformByNode(node) {
    if (!node) return;
    try {
      const { opinionConfig, buttonConfig, fieldConfig } = node;
      const button = JSON.parse(buttonConfig);
      const options: OptionConfig = JSON.parse(opinionConfig);
      button.forEach((i) => {
        const actionTitle = $t(`sys.process.paasBpmnButtonEvent.${i.type}`);
        this.buttonConfig[i.type] = {
          showModel: ![
            ButtonTypeEnum.Resubmit,
            ButtonTypeEnum.Withdraw,
            ButtonTypeEnum.End,
          ].includes(i.type),
          title: $t('sys.process.element.approval') + actionTitle,
          success: actionTitle + $t('sys.success') + '!',
          show: i.enable,
          alias: i.alias,
          signature: !!i.signature,
          opinion: {
            show: options.enabled,
            required: transformOption(options.opinionType, i.type),
          },
          user: {
            show: [ButtonTypeEnum.Reassign, ButtonTypeEnum.Countersign].includes(i.type),
            multiple: ButtonTypeEnum.Countersign === i.type,
            label: $t(`sys.process.user.${i.type}`),
          },
        };
      });
      this.fieldConfig = JSON.parse(fieldConfig);
      // console.log(this, button);
    } catch (error) {}
  }
  /**获取流程数据信息 */
  async getDataInfo() {
    const { dataId } = await getPmProcessEngineModel({
      processInstanceId: this.processInstanceId,
    });
    this.dataId = dataId;
  }
  /**过滤按钮 */
  filterButton(list: approveButton[]) {
    if (this.nonRelatedPerson) return [];
    if (this.examineAndApproveState === ExamineAndApproveStateEnum.MY_DONE) return [];
    return list.filter((i) => {
      if (i.type === FormComponents.ProcessApproveButton) {
        const status = this.buttonConfig[i.props.action!];
        const show = !!status?.show;
        if (show) {
          i.props.title = status.alias;
        }
        return show;
      }
      return true;
    });
  }
  /**修改字段状态 */
  useFieldWidget(widget: LowCodeWidget.BasicSchema) {
    if (this.nonRelatedPerson) return;
    const field = widget.props.field;
    const { fieldConfig, examineAndApproveState } = this;
    if (fieldConfig && fieldConfig[field]) {
      const { permission } = fieldConfig[field];
      switch (permission) {
        case FieldsPermissionEnum.disabled:
          widget.props.disabled = true;
          widget.props.readonly = false;
          break;
        case FieldsPermissionEnum.editable:
          widget.props.disabled = false;
          widget.props.readonly = false;
          break;
        case FieldsPermissionEnum.readonly:
          widget.props.readonly = true;
          break;
        default:
          break;
      }
    } else {
      widget.props.readonly = true;
    }

    if (
      !widget.props.disabled &&
      ([ExamineAndApproveStateEnum.MY_APPLICATION, ExamineAndApproveStateEnum.MY_DONE].includes(
        examineAndApproveState,
      ) ||
        this.isviewPage)
    ) {
      widget.props.readonly = true;
    }
  }
  /**修改字段显示隐藏状态 */
  useFieldToShow(widget: LowCodeWidget.BasicSchema) {
    const field = widget.props.field;
    const { fieldConfig } = this;
    if (fieldConfig && fieldConfig[field]) {
      const { permission } = fieldConfig[field];
      if (permission === FieldsPermissionEnum.hidden) {
        widget.props.hidden = true;
      }
    }
  }
}
function transformOption(opinionType: OpinionTypeEnum[], action: ButtonTypeEnum) {
  if (opinionType.includes(OpinionTypeEnum.Required)) {
    return true;
  }
  if (opinionType.includes(OpinionTypeEnum.Optional)) {
    return false;
  }
  if (opinionType.includes(OpinionTypeEnum.ApproveRequired)) {
    return action === ButtonTypeEnum.Approve;
  }
  if (opinionType.includes(OpinionTypeEnum.ApproveRequired)) {
    return action === ButtonTypeEnum.Approve;
  }
  if (opinionType.includes(OpinionTypeEnum.CountersignRequired)) {
    return action === ButtonTypeEnum.Countersign;
  }
  if (opinionType.includes(OpinionTypeEnum.ReassignRequired)) {
    return action === ButtonTypeEnum.Reassign;
  }
  if (opinionType.includes(OpinionTypeEnum.RejectRequired)) {
    return action === ButtonTypeEnum.Reject;
  }
  if (opinionType.includes(OpinionTypeEnum.RefuseRequired)) {
    return action === ButtonTypeEnum.Refuse;
  }
}

type ButtonConfig = {
  [key in ButtonTypeEnum]?: {
    /**成功的消息 */
    success: string;
    /**是否需要弹框 */
    showModel: boolean;
    /**模态框标题 */
    title: string;
    /**是否显示按钮 */
    show: boolean;
    /** 别名 */
    alias: string;
    /**需要签名 */
    signature: boolean;
    /**审批意见 */
    opinion: {
      /**是否需要 */
      show: boolean;
      /**是否必填 */
      required: boolean;
    };
    /**人员选择 */
    user: {
      /**是否显示 */
      show: boolean;
      /**是否多选 */
      multiple: boolean;
      label: string;
    };
  };
};

type FieldConfig = {
  [key: string]: {
    permission: string;
    children: FieldConfig[];
  };
};
type OptionConfig = {
  enabled: boolean;
  opinionType: OpinionTypeEnum;
};
/** */
export enum FieldsPermissionEnum {
  hidden = 'hidden',
  readonly = 'readonly',
  disabled = 'disabled',
  editable = 'editable',
}
