import { PropGroup, FormComponents, Platform } from '/@page-designer/enum';
import { WorkflowNodes } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { widget as btnGroup } from '../../web/layout/button-container';
import { buildShortUUID } from '/@/utils/uuid';
import { cloneDeep } from 'lodash-es';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { widget as modal } from '/@page-designer/schema/modal/workflow-node-modal';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { MaterialEnum } from '/@/enums/appEnum';

const { t } = useI18n();
const workflowModal = cloneDeep(modal);
workflowModal.id = buildShortUUID(modal.type);
const specModal = cloneDeep(modal);
specModal.id = buildShortUUID(modal.type);

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: WorkflowNodes = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.WorkflowNodes,
  icon: '',
  children: [],
  props: {
    workflowModalInfo: workflowModal,
    modalId: '',
    bindModelKey: '',
    specModalInfo: specModal,
    ...formItemProps,
    fieldType: undefined,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
  designerCache: {},
  a: ['props.operateColumn.props.btnOptions'],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,

  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),

  {
    component: 'workflow-nodes-modal-editor',
    name: { workflowModal: 'workflowModalInfo', specModal: 'specModalInfo' },
    label: '',
    group: PropGroup.MODAL,
    changeCallback: (widget) => {
      console.log('change', widget);
    },
    hidden: (widget) => {
      const { appInfo } = useAppInfoStore();
      console.log(appInfo, 'appInfo', widget);
      return appInfo.suiteKey !== 'MEDPRO';
      // return widget.props.editMode === SUB_TABLE_EDIT_MODE.INLINE;
    },
  },

  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: ['value'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'onGraphMounted',
    title: 'sys.pageDesigner.onMounted',
    params: ['graph'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (node) => {
  const id = buildShortUUID(FormComponents.ButtonContainer);
  node.children!.push({
    ...cloneDeep(btnGroup),
    id,
    alias: t(btnGroup.name) + id,
  });
};
