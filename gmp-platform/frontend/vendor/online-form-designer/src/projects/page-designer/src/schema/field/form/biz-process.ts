import { PropGroup, FormComponents, StyleGroup, TagTypeEnum, Platform } from '/@page-designer/enum';
import { BizProcess } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';

const { t } = useI18n();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BizProcess = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.BizProcess,
  icon: 'icon-zidingyi',
  children: [],
  props: {
    required: false,
    placeholder: '${sys.chooseText}',
    fieldType: undefined,
    showPreview: false, //是否显示预览
    ...formItemProps,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
  designerCache: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,

  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  ...commonFieldEditorConfig.placeholderEditor,

  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
  {
    component: 'switch-editor',
    name: 'showPreview',
    label: 'sys.pageDesigner.supportPreview',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return widget.props.readonly;
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [
  // {
  //   name: 'afterSelect',
  //   title: 'sys.pageDesigner.afterSelect',
  //   params: ['value', 'valueData'],
  // },
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: ['value', 'valueData'],
    hidden: (widget) => {
      return (
        widget.materialType !== MaterialEnum.MaterialTableField ||
        (widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB)
      );
    },
  },
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'valueData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
    params: [],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
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
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
  },
  {
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
  },
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
