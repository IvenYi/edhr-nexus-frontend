import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { Form } from '/@page-designer/types/mobile';
import { deepFindNotField, getCompPos } from '/@page-designer/schema/utils';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { getModelMetaListMasterModel } from '/@/apis/gct-apaas/ModelMetaController';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Form = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.form',
  alias: '',
  type: FormComponents.Form,
  icon: 'icon-biaodan',
  children: [],
  dropPlaceholder: '选择关联模型',

  props: {
    model: undefined,
    layout: {
      label: 'left',
      inputBg: false,
      inputAlign: 'right',
    },
    customFieldList: [],
    parentModelSelection: false,
    refParentModelkey: '',
    validateRule: [],
    hasLabelWidth: undefined,
    labelType: 'percent',
    labelWidth: 30,
    overLabelDisplay: undefined,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.FORM_CONFIG,
    required: true,
    _config: {
      type: 'NDO,BASE,TREE,TRANSACTION,TXN_EXT',
      clearChildren: false,
      category: 'entity,data,view',
    },
    hidden: (widget) => {
      return getCompPos(widget, FIELD_TYPE.MASTERSLAVE, FormComponents.Form);
    },
    changeCallback(widget: Form) {
      if (widget.children && widget.children.length) {
        widget.children = deepFindNotField(widget.children);
      }
      widget.dropPlaceholder = widget.props.model ? '拖拽组件/字段到这里' : '选择关联模型';
    },
  },
  {
    component: 'switch-editor',
    name: 'parentModelSelection',
    label: 'sys.pageDesigner.parentModelFieldSelection',
    dependentProps: ['model'],
    group: PropGroup.FORM_CONFIG,
    changeCallback(widget: Form, value: boolean) {
      if (!value) {
        widget.props.refParentModelkey = '';
        widget.children = widget.children!.filter((i) => i.props.bindFieldKey !== 'ref_master_id_');
      }
    },
    hidden(widget: Form) {
      return widget.props.modeldata?.subModel !== 1;
    },
  },
  {
    component: 'select-editor',
    name: 'refParentModelkey',
    label: 'sys.pageDesigner.refParentModelkey',
    dependentProps: ['model', 'parentModelSelection'],
    group: PropGroup.FORM_CONFIG,
    _config: {
      clearable: false,
      options: async (widget: Form) => {
        const models = await getModelMetaListMasterModel({
          subModelKey: widget.props.model!,
        });
        if (models?.length === 1) {
          widget.props.refParentModelkey = models[0].key || '';
        }
        return models?.map((i) => {
          return { value: i.key, label: i.name };
        });
      },
    },
  },
  {
    component: 'switch-editor',
    name: 'readonly',
    label: 'sys.pageDesigner.filedWholeReadonly',
    group: PropGroup.FORM_CONFIG,
    hidden(widget: Form) {
      return !widget.props.model;
    },
    _config: {},
  },
  {
    component: 'mobile-form-layout-editor',
    name: 'layout',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    dependentProps: ['model'],
  },
  {
    component: 'switch-editor',
    name: 'hasLabelWidth',
    label: 'sys.pageDesigner.hasLabelWidthConfig',
    group: PropGroup.FIELD_LAYOUT,
    dependentProps: ['model'],
    hidden(widget: Form) {
      return widget.props.layout.label === 'top';
    },
  },
  {
    component: 'label-width-editor',
    name: { labelType: 'labelType', labelWidth: 'labelWidth' },
    label: 'sys.pageDesigner.labelWidthTip',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: Form) {
      return widget.props.layout.label === 'top' || !widget.props.hasLabelWidth;
    },
  },
  {
    component: 'over-label-display-editor',
    name: 'overLabelDisplay',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: Form) {
      return widget.props.layout.label === 'top' || !widget.props.hasLabelWidth;
    },
  },
  {
    component: 'validate-editor',
    name: 'validateRule',
    label: '',
    group: PropGroup.VALIDATERULE,
    _config: {
      modelKey: 'model',
    },
    dependentProps: ['model'],
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
  {
    component: 'border-radius-editor',
    group: StyleGroup.BORDER,
  },
  {
    component: 'border-editor',
    group: StyleGroup.BORDER,
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const blackList: (string | RegExp)[] = [
  FormComponents.Form,
  FormComponents.RdoForm,
  FormComponents.FormProcess,
  FormComponents.MedProRdoForm,
];
