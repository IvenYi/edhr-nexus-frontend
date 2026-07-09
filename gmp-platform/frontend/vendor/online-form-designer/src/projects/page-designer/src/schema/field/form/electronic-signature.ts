import {
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  StyleGroup,
} from '/@page-designer/enum';
import { Textarea } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor as editor, displayProps } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum, FIELD_TYPE } from '/@/enums/appEnum';
import { changeCmpData } from '../../utils';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Textarea, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.ElectronicSignature,
  icon: '',
  props: {
    defaultValue: undefined,
    bindCompStyleType: BindCmpStyleEnum.CMP_ELECTRONICSIGNATURE,
    fieldType: undefined,
    embeddedSearch: true,
    field: '',
    fieldId: '',
    label: '',
    modelKey: '',
    explain: '',
    showExplain: false,
    displayLabelText: true,
    readonly: true,
    ...displayProps,
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
    changeCallback(widget) {
      widget.props.bindCompStyleType = BindCmpStyleEnum.CMP_TEXTAREA;
      changeCmpData(widget);
    },
    hidden(widget: Textarea) {
      return widget.props.fieldType !== FIELD_TYPE.LONG_TEXT;
    },
  },
  {
    component: 'bind-cmp-type-editor',
    name: 'bindCompStyleType',
    label: 'sys.pageDesigner.bindCmpStyleLabel',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      bindCmpStyleKey: (widget: Textarea) => {
        if (widget.props.fieldType === FIELD_TYPE.LONG_TEXT) {
          return BindCmpStyleTypeEnum.BindLongText;
        } else {
          return BindCmpStyleTypeEnum.BindText;
        }
      },
    },
    changeCallback(widget) {
      changeCmpData(widget);
    },
  },
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
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
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (_node: Textarea) => {};
