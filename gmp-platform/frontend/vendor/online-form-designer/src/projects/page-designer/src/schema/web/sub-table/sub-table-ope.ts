import {
  fixedAlignENUM,
  PropGroup,
  ButtonColorTheme,
  ButtonColorType,
  FormComponents,
  SUB_TABLE_OPE_EVENT_TYPE,
  SUB_TABLE_EDIT_MODE,
} from '/@page-designer/enum';
import { SubTableOpe, SubTableOpeButtonProps } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

export const widget: SubTableOpe = {
  //字段标识
  id: '',
  type: FormComponents.SubTableOpe,
  // 国际化信息
  i18n: {},
  internal: true,
  name: 'sys.pageDesigner.operate',
  props: {
    bindModelKey: '',
    width: 120,
    label: 'sys.pageDesigner.operate',
    /**可见按钮数量 */
    visibleButtons: 1,
    fixed: false,
    fixedAlign: fixedAlignENUM.RIGHT,
    btnOptions: [],
    editMode: SUB_TABLE_EDIT_MODE.MODAL,
  },
};
export const operateButton: SubTableOpeButtonProps = {
  //字段标识
  id: '',
  type: 'STOpeButton',
  // 国际化信息
  i18n: {},
  props: {
    buttonTheme: ButtonColorTheme.DEFAULT,
    buttonType: ButtonColorType.LINK,
    icon: '',
    label: '',
    /**二次确认 */
    confirm: false,
    confirmText: '',
    /**显示条件 */
    displayRule: '',
    eventName: '',
    eventType: SUB_TABLE_OPE_EVENT_TYPE.DELETE,
  },
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
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.pageDesigner.columnWidth',
    group: PropGroup.BASIC,
    _config: {
      addonAfter: 'px',
      min: 80,
      max: 300,
    },
  },
  {
    component: 'number-editor',
    name: 'visibleButtons',
    label: 'sys.pageDesigner.visibleButtons',
    group: PropGroup.BASIC,
    _config: {
      min: 1,
      max: 10,
    },
  },
  {
    component: 'sub-table-ope-editor',
    name: 'btnOptions',
    label: 'sys.pageDesigner.operateButton',
    group: PropGroup.BASIC,
  },
];
export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
