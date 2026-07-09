import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { FormProcess } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { getPmProcessDefinitionListAllProcHasPublishedVersion } from '/@/apis/gct-apaas/PmProcessDefinitionController';
import { deepFindNotField } from '../../utils';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: FormProcess = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.formProcess',
  alias: '',
  type: FormComponents.FormProcess,
  icon: 'icon-biaodan',
  children: [],
  props: {
    model: undefined,
    processId: '',
    layout: 'horizontal',
    customFieldList: [],
    hasLabelWidth: undefined,
    labelType: 'percent',
    labelWidth: 30,
    overLabelDisplay: undefined,
    parentModelSelection: false,
    refParentModelkey: '',
    readonly: false,
    validateRule: [],
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
  ignoringStyle: [],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'select-group-editor',
    name: 'processId',
    label: 'sys.pageDesigner.refProcess',
    group: PropGroup.FORM_CONFIG,
    required: true,
    _config: {
      async eventCallback(widget, value = {}) {
        if (!value?.modelKey) return;
        widget.props.model = value.modelKey;
        const data = await getModelMetaDetail({ modelKey: value.modelKey });
        widget.props.modeldata = {
          /**模型类型 基础/版本/树 等等 */
          modelType: data.type,
          /**模型大类 */
          modelCategory: data.modelCategory,
          /**1表示子表 0表示主表 */
          subModel: data.subModel,
          /**1表示流程模型 */
          supportProcess: data.supportProcess,
        };
      },
      options: async (widget) => {
        const res = await getPmProcessDefinitionListAllProcHasPublishedVersion({
          moduleType: 'approval_process_module',
        });

        return (
          res
            ?.map((i) => {
              return {
                value: i.id,
                label: i.name,
                children: i.children?.map((p) => {
                  return {
                    value: p.id,
                    label: p.name,
                    modelKey: p.modelKey,
                  };
                }),
              };
            })
            ?.filter((i) => i.children?.length) || []
        );
      },
    },
    changeCallback(widget: FormProcess) {
      console.log('widget', widget);

      if (widget.children && widget.children.length) {
        widget.children = deepFindNotField(widget.children);
      }
    },
  },
  {
    component: 'form-layout-editor',
    name: 'layout',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    dependentProps: ['model'],
  },
  // {
  //   component: 'switch-editor',
  //   name: 'hasLabelWidth',
  //   label: 'sys.pageDesigner.hasLabelWidthConfig',
  //   group: PropGroup.FIELD_LAYOUT,
  //   dependentProps: ['model'],
  //   hidden(widget: Form) {
  //     return widget.props.layout !== 'horizontal';
  //   },
  // },
  {
    component: 'label-width-editor',
    name: { labelType: 'labelType', labelWidth: 'labelWidth' },
    label: 'sys.pageDesigner.labelWidthTip',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: Form) {
      return widget.props.layout !== 'horizontal' || !widget.props.hasLabelWidth;
    },
  },
  {
    component: 'over-label-display-editor',
    name: 'overLabelDisplay',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: Form) {
      return widget.props.layout !== 'horizontal' || !widget.props.hasLabelWidth;
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
