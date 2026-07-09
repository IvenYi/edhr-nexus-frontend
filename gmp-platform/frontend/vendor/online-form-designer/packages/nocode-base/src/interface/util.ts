import { cloneDeep, has } from 'lodash-es';
import { FIELD_TYPE } from '@gct/runtime';
import { safeParseArray, mergeByMultiKey } from '../_utils_';
import {
  FormTypeEnum,
  RenderModeEnum,
  BpmnNodeTypeEnum,
  ButtonTypeEnum,
  BpmnSignatureTypeEnum,
  ComponentTypeEnum,
} from '../constant';

// 流程表单接口
import {
  postOnlineFormProcessSave,
  postOnlineFormProcessSubmit,
  postOnlineFormProcessReturn,
  postOnlineFormProcessReassign,
  postOnlineFormProcessApprove,
  postOnlineFormProcessJump,
  postOnlineFormProcessApproveQualification,
  postOnlineFormProcessPartialSubmit,
} from '/@/apis/gct-apaas/OnlineFormProcessController';

// 基础表单接口
import {
  postOnlineFormStash,
  postOnlineFormPartialSubmit,
} from '/@/apis/gct-apaas/OnlineFormStashController';
import { postOnlineFormBaseSubmit } from '/@/apis/gct-apaas/OnlineFormBaseController';

// 表单变更接口
import {
  postFormChangeProcessReturn,
  postFormChangeProcessReassign,
  postFormChangeProcessApprove,
  postMedproFormChangeProcessReturn,
  postMedproFormChangeProcessReassign,
  postMedproFormChangeProcessApprove,
} from '/@/apis/gct-apaas/FormChangeProcessController';

// 表单变更接口 - medPro
// import {
//   postMedproApproveProcessReturn,
//   postMedproApproveProcessReassign,
//   postMedproApproveProcessApprove,
// } from '/@/apis/gct-apaas/MedproApproveProcessController';

export const commonUtils = {
  /** 列表转成树 */
  listTransformTree: (list: Array<any>) => {
    const cloneData = cloneDeep(list);
    const result: any = [];
    const map = new Map();

    cloneData.forEach((item) => {
      map.set(item.id, { ...item, selectable: item.type === 'DOC', children: [] });
    });

    cloneData.forEach((item) => {
      const node = map.get(item.id);
      if (item.rootNode) {
        result.push(node);
      } else {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return result;
  },

  findFirstDoc: (tree, ofId?: string) => {
    const cloneTree = cloneDeep(tree);

    const queue = [...cloneTree];

    while (queue.length > 0) {
      const node = queue.shift();

      if (node.type === 'DOC' || !node.type) {
        if (ofId) {
          if (node.id === ofId || node.tmplId === ofId) {
            return node;
          }
        } else {
          return node;
        }
      }

      if (node.children && node.children.length > 0) {
        queue.push(...node.children);
      }
    }

    return null;
  },

  uuid2: (len, radix?: any) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid: any = [],
      i;
    radix = radix || chars.length;
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
    } else {
      // rfc4122, version 4 form
      let r;
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | (Math.random() * 16);
          uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uuid.join('');
  },

  isEmptyValue: (value: any): boolean => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    );
  },

  get gctInstanceStatusTheme() {
    return {
      'gct-nocode-instance-status--stash': {
        textColor: '#F77E4A',
        background: 'rgba(247,126,74,0.1)',
        iconBackground: '#FFC837',
        placeholder: $t('sys.edhr.formInsStatusEnum.STASH'),
      },
      'gct-nocode-instance-status--partial-submit': {
        textColor: '#FFAA00',
        background: 'rgba(255,170,0,0.1)',
        iconBackground: '#FFD666',
        placeholder: $t('sys.appDesigner.approval.button.PartialSubmit'),
      },
      'gct-nocode-instance-status--finish': {
        textColor: '#309C41',
        background: 'rgba(48,156,65,0.1)',
        iconBackground: '#76DA57',
        placeholder: $t('sys.bpmn.flowNodeInstStatus.COMPLETED'),
      },
      'gct-nocode-instance-status--abnormal': {
        textColor: '#F54547',
        background: ' rgba(245,69,71,0.1)',
        iconBackground: '#FF6776',
        placeholder: $t('sys.bpmn.flowNodeInstStatus.EXCEPTION'),
      },
      'gct-nocode-instance-status--not-filled': {
        textColor: '#6D82B0',
        background: '#E6EEFF',
        iconBackground: '#B4C8F4',
        placeholder: $t('sys.edhr.instanceStatus2DhrEnum.UNFILLED'),
      },
      'gct-nocode-instance-status--running': {
        textColor: '#13C2C2',
        background: 'rgba(19,194,194,0.1)',
        iconBackground: '#13C2C2',
        placeholder: $t('sys.bpmn.bizNodeInstStatus.running'),
      },
      'gct-nocode-instance-status--already-filled': {
        textColor: '#026AC8',
        background: ' rgba(2,106,200,0.1)',
        iconBackground: '#026AC8',
        placeholder: $t('sys.edhr.instanceStatus2DhrEnum.FILLED'),
      },
      'gct-nocode-instance-status--invalid': {
        textColor: '#737A87',
        background: '#E5E5E5',
        iconBackground: '#C3C3C3',
        placeholder: $t('sys.edhr.dhrLogType.ABANDON'),
      },
      'gct-nocode-instance-status--archived': {
        textColor: '#dda200',
        background: '#faf3df',
        iconBackground: '#dda200',
        placeholder: $t('sys.edhr.recordBook.archived'),
      },
      'gct-nocode-instance-status--tmpl': {
        textColor: '#742fb2',
        background: '#f9f2ff',
        iconBackground: '#742fb2',
        placeholder: $t('sys.appDesigner.template'),
      },
      'gct-nocode-instance-status--in-audit': {
        textColor: '#FF52C5',
        background: 'rgba(255,82,197, 0.1)',
        iconBackground: '#FF52C5',
        placeholder: $t('sys.edhr.instanceStatus2FormEnum.IN_AUDIT'),
      },
    };
  },
};

export function useOnlineFormActionButton() {
  const baseBtn: any[] = [
    {
      type: 'Cancel',
      customTitle: $t('sys.cancelText'),
      title: $t('sys.cancelText'),
      enable: 1,
      buttonType: 'builtin',
      isCustom: false,
    },
  ];

  /** 流程表单按钮组 */
  const processFormBtnGroup = [
    {
      type: ButtonTypeEnum.Return,
      title: $t('sys.appDesigner.approval.button.Return'),
      api: postOnlineFormProcessReturn,
    },
    {
      type: ButtonTypeEnum.Reassign,
      title: $t('sys.appDesigner.approval.button.Reassign'),
      style: {
        type: 'primary',
      },
      api: postOnlineFormProcessReassign,
    },
    {
      type: ButtonTypeEnum.Save,
      title: $t('sys.saveText'),
      style: {
        type: 'primary',
      },
      api: postOnlineFormProcessSave,
    },
    {
      type: ButtonTypeEnum.PartialSubmit,
      title: $t('sys.appDesigner.approval.button.PartialSubmit'),
      style: {
        type: 'primary',
      },
      api: postOnlineFormProcessPartialSubmit,
    },
    {
      type: ButtonTypeEnum.Submit,
      title: $t('sys.submit'),
      style: {
        type: 'primary',
      },
      api: postOnlineFormProcessSubmit,
    },
    {
      type: ButtonTypeEnum.Approve,
      title: $t('sys.appDesigner.approval.button.Approve'),
      style: {
        type: 'primary',
      },
      api: postOnlineFormProcessApprove,
    },
    {
      type: ButtonTypeEnum.Qualified,
      title: $t('sys.appDesigner.approval.button.Qualified'),
      api: postOnlineFormProcessApproveQualification,
    },
    {
      type: ButtonTypeEnum.Unqualified,
      title: $t('sys.appDesigner.approval.button.Unqualified'),
      api: postOnlineFormProcessApprove,
    },
  ];

  /** 表单变更按钮组 */
  const formChangeBtnGroup = [
    {
      type: ButtonTypeEnum.Return,
      title: $t('sys.appDesigner.approval.button.Return'),
      api: postFormChangeProcessReturn,
      medproApi: postMedproFormChangeProcessReturn,
    },
    {
      type: ButtonTypeEnum.Reassign,
      title: $t('sys.appDesigner.approval.button.Reassign'),
      style: {
        type: 'primary',
      },
      api: postFormChangeProcessReassign,
      medproApi: postMedproFormChangeProcessReassign,
    },
    {
      type: ButtonTypeEnum.Approve,
      title: $t('sys.appDesigner.approval.button.Approve'),
      style: {
        type: 'primary',
      },
      api: postFormChangeProcessApprove,
      medproApi: postMedproFormChangeProcessApprove,
    },
  ];

  function renderActionButton(
    showButtons: string[],
    buttonConfig: string,
    options: {
      formType: FormTypeEnum;
      bpmnType: BpmnNodeTypeEnum;
      modeType: RenderModeEnum;
      inDrawer: boolean;
      isViewPage: boolean;
      isRecordFill: boolean;
      processOperation?: string; // 制程配置上的表单按钮配置
      isFormChangeApprovalPage?: boolean;
      isMedPro?: boolean;
    },
  ) {
    const { formType, inDrawer, isViewPage, isRecordFill, processOperation } = options || {};

    const _baseBtn = inDrawer && !isViewPage ? baseBtn.slice() : [];

    if (!formType || formType === FormTypeEnum.TEXT || formType === FormTypeEnum.VIEW) {
      return [];
    }

    if (options.isFormChangeApprovalPage) {
      const buttonMap = safeParseArray(buttonConfig).reduce((acc, current) => {
        acc[current.type] = current;
        return acc;
      }, {});

      return formChangeBtnGroup
        .filter((info) => showButtons.includes(info.type))
        .map((item) => {
          const btn = buttonMap?.[item.type];
          if (btn && btn.enable) {
            return {
              ...btn,
              style: {
                ...item.style,
                ...btn.style,
              },
              buttonType: 'builtin',
              customTitle: btn.alias || item.title || $t('sys.pageDesigner.button'),
              belongFormChangeApproval: true,
              api: options.isMedPro ? item.medproApi : item.api,
            };
          }
        })
        .filter((i) => i) as any;
    }

    // 基础表单/文件表单
    if (formType === FormTypeEnum.BASE || formType === FormTypeEnum.FILE) {
      if (options.modeType === RenderModeEnum.ViewMode) {
        return [];
      }

      return _baseBtn.concat(
        mergeByMultiKey(safeParseArray(buttonConfig), safeParseArray(processOperation), {
          keyFields: ['type', 'buttonType'],
        })
          .filter((btn) => {
            return (
              Boolean(btn.enable) &&
              (!isRecordFill ||
                (btn.buttonType === 'builtin' &&
                  (btn.type === ButtonTypeEnum.Save || btn.type === ButtonTypeEnum.Submit)))
            );
          })
          .map((btn) => {
            const isSaveOrSubmit =
              btn.buttonType === 'builtin' &&
              [ButtonTypeEnum.Submit, ButtonTypeEnum.Save, ButtonTypeEnum.PartialSubmit].includes(
                btn.type,
              );
            return {
              ...btn,
              ...(isSaveOrSubmit && {
                style: {
                  type: 'primary',
                  ...btn.style,
                },
              }),
              customTitle: btn.alias || btn.title || $t('sys.pageDesigner.button'),
              signatureType: btn.signatureType || BpmnSignatureTypeEnum.None,
              api:
                btn.type === ButtonTypeEnum.PartialSubmit
                  ? postOnlineFormPartialSubmit
                  : btn.type === ButtonTypeEnum.Save
                    ? postOnlineFormStash
                    : postOnlineFormBaseSubmit,
            };
          })
          .sort((a, b) => (a.buttonType === b.buttonType ? 0 : a.buttonType === 'custom' ? 1 : -1)),
      );
    }

    // 流程表单非结束节点
    if (formType === FormTypeEnum.PROCESS && options.bpmnType !== BpmnNodeTypeEnum.BpmnEnd) {
      if (isViewPage || options.modeType === RenderModeEnum.ViewMode) {
        return [];
      }

      const buttonMap = mergeByMultiKey(
        safeParseArray(buttonConfig),
        safeParseArray(processOperation),
      ).reduce((acc, current) => {
        acc[current.type] = current;
        return acc;
      }, {});
      // 流程自定义按钮
      const customButton: any[] = Object.values(buttonMap)
        .filter(
          (btn: any) =>
            btn.enable && has(btn, 'isCustom') && btn.isCustom && showButtons.includes(btn.type),
        )
        .map((item: any) => {
          const btn = buttonMap?.[item.type];
          return {
            ...btn,
            buttonType: 'custom',
            customTitle: btn.alias || item.title || $t('sys.pageDesigner.button'),
            api: postOnlineFormProcessJump,
          };
        });

      return _baseBtn.concat(customButton).concat(
        // 流程表单内置按钮
        processFormBtnGroup
          .filter((info) => showButtons.includes(info.type))
          .map((item) => {
            const btn = buttonMap?.[item.type];
            if (btn && btn.enable && !btn.isCustom) {
              return {
                ...btn,
                style: {
                  ...item.style,
                  ...btn.style,
                },
                buttonType: 'builtin',
                customTitle: btn.alias || item.title || $t('sys.pageDesigner.button'),
                api: item.api,
              };
            }
          })
          .filter((i) => i) as any,
      );
    }

    return _baseBtn;
  }

  const autoSaveButtonMap = {
    [FormTypeEnum.BASE]: {
      type: ButtonTypeEnum.Save,
      title: $t('sys.saveText'),
      customTitle: $t('sys.saveText'),
      buttonType: 'builtin',
      api: postOnlineFormStash,
    },
    [FormTypeEnum.PROCESS]: {
      type: ButtonTypeEnum.Save,
      title: $t('sys.saveText'),
      customTitle: $t('sys.saveText'),
      buttonType: 'builtin',
      api: postOnlineFormProcessSave,
    },
  };

  return {
    renderActionButton,
    autoSaveButtonMap,
  };
}

/** 字段转换组件 */
export const useOnlineFormTransformField2Component = (fieldType: FIELD_TYPE) => {
  return {
    [FIELD_TYPE.TEXT]: {
      cmpKey: ComponentTypeEnum.Input,
    },
    [FIELD_TYPE.LONG_TEXT]: {
      cmpKey: ComponentTypeEnum.Textarea,
    },
    [FIELD_TYPE.INTEGER]: {
      cmpKey: ComponentTypeEnum.Inputnumber,
    },
    [FIELD_TYPE.LONG]: {
      cmpKey: ComponentTypeEnum.Inputnumber,
    },

    [FIELD_TYPE.DOUBLE]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },

    [FIELD_TYPE.DECIMAL]: {
      cmpKey: ComponentTypeEnum.Inputnumber,
    },
    [FIELD_TYPE.BOOLEAN]: {
      cmpKey: ComponentTypeEnum.Switch,
    },
    [FIELD_TYPE.SERIAL]: {
      cmpKey: ComponentTypeEnum.Input,
    },
    [FIELD_TYPE.IMAGE]: {
      cmpKey: ComponentTypeEnum.UploadImage,
    },
    [FIELD_TYPE.SIGNATURE]: {
      cmpKey: ComponentTypeEnum.Sign,
    },
    [FIELD_TYPE.ATTACHMENT]: {
      cmpKey: ComponentTypeEnum.UploadFile,
    },
    [FIELD_TYPE.USER]: {
      cmpKey: ComponentTypeEnum.Userpicker,
    },
    [FIELD_TYPE.USER_MULTI]: {
      cmpKey: ComponentTypeEnum.Userpicker,
    },
    [FIELD_TYPE.ORG]: {
      cmpKey: ComponentTypeEnum.Department,
    },
    [FIELD_TYPE.ORG_MULTI]: {
      cmpKey: ComponentTypeEnum.Department,
    },
    [FIELD_TYPE.ENUM]: {
      cmpKey: ComponentTypeEnum.EnumSelect,
    },
    [FIELD_TYPE.ENUM_MULTI]: {
      cmpKey: ComponentTypeEnum.EnumSelect,
    },
    [FIELD_TYPE.OPTION]: {
      cmpKey: ComponentTypeEnum.EnumSelect,
    },
    [FIELD_TYPE.OPTION_MULTI]: {
      cmpKey: ComponentTypeEnum.EnumSelect,
    },
    [FIELD_TYPE.REF]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.REF_MULTI]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.DATE]: {
      cmpKey: ComponentTypeEnum.Datepicker,
    },
    [FIELD_TYPE.DATE_TIME]: {
      cmpKey: ComponentTypeEnum.DateTimepicker,
    },
    [FIELD_TYPE.TIME]: {
      cmpKey: ComponentTypeEnum.Timepicker,
    },

    [FIELD_TYPE.EXPRESSION]: {
      cmpKey: ComponentTypeEnum.EXPRESSION,
    },
    [FIELD_TYPE.AGG]: {
      cmpKey: ComponentTypeEnum.AGG,
    },
    [FIELD_TYPE.MATERIAL_NO]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.RELATED_LOT_NO]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.PRODUCT]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.DEVICE]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.MFG_ORDER]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.RECORD_NO]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.TRACE_DATE]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.ORDER_NO]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.ROUTING_OPERATION]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.GOOD_QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.NOT_GOOD_QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.REPORT_START_TIME]: {
      cmpKey: ComponentTypeEnum.DateTimepicker,
    },
    [FIELD_TYPE.REPORT_END_TIME]: {
      cmpKey: ComponentTypeEnum.DateTimepicker,
    },
    [FIELD_TYPE.WORK_HOURS]: {
      cmpKey: ComponentTypeEnum.Inputnumber,
    },
    [FIELD_TYPE.PRODUCTION_DATE]: {
      cmpKey: ComponentTypeEnum.Datepicker,
    },
    [FIELD_TYPE.REPORTER]: {
      cmpKey: ComponentTypeEnum.Sign,
    },
    [FIELD_TYPE.NOT_GOOD_REASON]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.NOT_GOOD_GROUP]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.SCRAP_REASON]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.SCRAP_GROUP]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.SCRAP_QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.SCRAP_MATERIAL]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.SCRAP_MATERIAL_NO]: {
      cmpKey: ComponentTypeEnum.Trace,
    },
    [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.PRODUCT_CHECK_QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.MATERIAL_CHECK_QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.QTY_REQUIRED]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.QTY_CONSUMED]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.QTY]: {
      cmpKey: ComponentTypeEnum.InputDouble,
    },
    [FIELD_TYPE.DEVICE_REF]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.DEVICE_REF_MULTI]: {
      cmpKey: ComponentTypeEnum.Select,
    },
    [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: {
      cmpKey: ComponentTypeEnum.Input,
    },
    [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: {
      cmpKey: ComponentTypeEnum.Datepicker,
    },
    [FIELD_TYPE.WAREHOUSE_MANAGER]: {
      cmpKey: ComponentTypeEnum.Sign,
    },
  }[fieldType];
};
