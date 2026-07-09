import {
  fixedAlignENUM,
  PropGroup,
  FormComponents,
  tableColumnWidthEnum,
  Platform,
  StyleGroup,
} from '/@page-designer/enum';
import { OperateTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayProps, displayEditor } from '../../../common-config/display-editor-config';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { MaterialEnum } from '/@/enums/appEnum';
import columnEditorConfig from '../../../common-config/column-editor-config';

export const widget: OperateTable = {
  //字段标识
  id: '',
  type: FormComponents.DataTableOpe,
  // 国际化信息
  i18n: {},
  internal: true,
  name: 'sys.pageDesigner.operate',
  alias: '',
  children: [],
  icon: 'icon-shezhi',
  platform: Platform.WEB,
  props: {
    model: '',
    label: '${sys.pageDesigner.operate}',
    /**可见按钮数量 */
    visibleButtons: 1,
    fixedAlign: fixedAlignENUM.RIGHT /**列宽配置 */,
    ...displayProps,
  },
  style: {
    columnwidth: 100,
    columnwidthConfigure: tableColumnWidthEnum.ENUMERATION,
  },
  preLocation: '',
  materialType: MaterialEnum.MaterialTableField,
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'label',
    label: 'sys.pageDesigner.title',
    group: PropGroup.BASIC,
    _config: {
      i18n: true,
    },
  },
  ...columnEditorConfig.fixedAlignEditor,
  {
    component: 'number-editor',
    name: 'visibleButtons',
    label: 'sys.pageDesigner.visibleButtons',
    group: PropGroup.SHOW,
    _config: {
      min: 1,
      max: 10,
    },
  },
  {
    component: 'button-list-editor',
    name: '',
    label: 'sys.pageDesigner.operateButton',
    group: PropGroup.SHOW,
    _config: {
      createField: () => createWidgetByType(FormComponents.OpeButton),
    },
  },
  // {
  //   component: 'sub-table-ope-editor',
  //   name: '',
  //   label: 'sys.pageDesigner.operateButton',
  //   group: PropGroup.SHOW,

  // },
  ...displayEditor,
];
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  // 字段名称
  {
    component: 'column-width-editor',
    name: { number: 'columnwidth', type: 'columnwidthConfigure' },
    label: '',
    group: StyleGroup.LAYOUT,
    _config: {
      columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.ENUMERATION],
    },
  },
];
export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const beforeCreate = (widget: OperateTable) => {
  // colunmCreate(widget);
  widget.id = undefined;
};

export const designerConfig: LowCodeWidget.DesignerConfig = {
  basicProps: {
    alias_hidden: true,
    key_hidden: true,
  },
};
