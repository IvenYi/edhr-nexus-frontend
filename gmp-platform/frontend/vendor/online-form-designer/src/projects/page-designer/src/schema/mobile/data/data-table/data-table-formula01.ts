import { fixedAlignENUM, PropGroup, FormComponents, Platform } from '/@page-designer/enum';
import { FormulaTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayProps, displayEditor } from '../../../common-config/display-editor-config';
import { columncommonStyle, columnStyleEditorList, colunmCreate } from './__common';
import { ReturnTypeEnum } from '/@/components/Expression/types';

export const widget: FormulaTable = {
  //字段标识
  id: '',
  type: FormComponents.DataTableFormula,
  // 国际化信息
  i18n: {},
  internal: true,
  name: 'sys.pageDesigner.formula',
  alias: '',
  children: [],
  icon: 'icon-gongshiziduan',
  platform: Platform.MOBILE,
  props: {
    model: '',
    label: '',
    fixedAlign: fixedAlignENUM.NONE /**列宽配置 */,
    formula: '',
    remark: '',
    field: '',
    fieldType: ReturnTypeEnum.String,
    showSearch: false,
    truelabel: '真',
    falselabel: '假',
    readonly: true,
    fieldReadonly: true,
    ...displayProps,
  },
  style: {
    ...columncommonStyle,
  },
  preLocation: '',
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  // 字段名称
  {
    component: 'custom-name-editor',
    name: 'label',
    label: 'sys.pageDesigner.fieldTitle',
    group: PropGroup.BASIC,
  },
  {
    component: 'boolean-editor',
    name: { truevalue: 'truelabel', falsevalue: 'falselabel' },
    label: 'sys.pageDesigner.booleanOptions',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return widget.props.fieldType !== ReturnTypeEnum.Boolen;
    },
  },
  ...displayEditor,
];
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...columnStyleEditorList];
export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const beforeCreate = (widget: FormulaTable) => {
  colunmCreate(widget);
};
export const designerConfig: LowCodeWidget.DesignerConfig = {
  basicProps: {
    alias_hidden: true,
    key_hidden: true,
  },
};
