import { PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { UploadFile } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LowCodeWidget.FieldSchema = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.LabelTemplate,
  icon: '',
  props: {
    ...formItemProps,
    required: false,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  {
    component: 'input-attr-editor',
    name: '',
    label: 'sys.pageDesigner.inputAttr',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      needFieldAttrs: ['required', 'readonly'],
    },
    hidden(widget: LowCodeWidget.FieldSchema) {
      return (
        widget.props.bindFieldKey ||
        widget.materialType !== MaterialEnum.MaterialFormField ||
        widget.props.fieldReadonly
      );
    },
  },
  ...commonFieldEditorConfig.validatorEditor,
  ...editor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

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
];
