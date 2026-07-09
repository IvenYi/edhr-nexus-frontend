import {
  FormComponents,
  StyleGroup,
  TagTypeEnum,
  TextDecoration,
  ProgressTypeEnum,
  tagEnum,
  PropGroup,
  BindCmpStyleTypeEnum,
  BindCmpStyleEnum,
} from '/@page-designer/enum';
import { FormulaTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { ReturnTypeEnum, EntityFormulaReturnTypeEnum } from '/@/components/Expression/types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { buildShortUUID } from '/@/utils/uuid';

export const widget: PartialByKeys<FormulaTable, 'platform'> = {
  //字段标识
  id: '',
  platform: undefined,
  name: 'sys.pageDesigner.formula',
  alias: '',
  type: FormComponents.DataTableFormula,
  icon: 'icon-gongshiziduan',
  props: {
    ...formItemProps,
    model: '',
    formula: '',
    remark: '',
    fieldType: EntityFormulaReturnTypeEnum.Text || ReturnTypeEnum.String,
    showSearch: false,
    truelabel: '真',
    falselabel: '假',
    digits: 0,
    readonly: true,
    fieldReadonly: true,
    bindCompStyleType: BindCmpStyleEnum.CMP_SELECT_LIST,
    expression: '',
  },
  style: {
    columnFontStyleByRule: [],
  },
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  {
    component: 'boolean-editor',
    name: { truevalue: 'truelabel', falsevalue: 'falselabel' },
    label: 'sys.pageDesigner.booleanOptions',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return widget.props.returnType !== EntityFormulaReturnTypeEnum.Boolen;
    },
  },
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: BindCmpStyleTypeEnum.BindBool,
    groupName: PropGroup.FIELD_CONFIG,
    hiddenCallback(widget) {
      return widget.props.returnType !== EntityFormulaReturnTypeEnum.Boolen;
    },
  }),
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
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
    component: 'column-tag-editor',
    name: 'columnFontStyleByRule',
    label: '',
    group: StyleGroup.STYLE,
    _config: {
      generator: getFontStyleRule,
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (widget: FormulaTable) => {
  widget.style.columnFontStyleByRule = [getFontStyleRule()];
};

/**添加样式规则 */
function getFontStyleRule() {
  return {
    id: buildShortUUID('content'),
    displayRule: '',
    contentFont: {
      fontSize: '',
      bold: false,
      italic: false,
      textDecoration: TextDecoration.NONE,
      color: '',
      align: 'left',
    },
    tagStyle: {
      color: '#0DAA9C',
      tagType: TagTypeEnum.RADIUS,
      progressBarType: ProgressTypeEnum.CIRCLE,
    },
    progressStyle: {
      color: '#0DAA9C',
      tagType: ProgressTypeEnum.CIRCLE,
    },
    tagType: tagEnum.TAG,
    tagStyleOpen: false,
  };
}
