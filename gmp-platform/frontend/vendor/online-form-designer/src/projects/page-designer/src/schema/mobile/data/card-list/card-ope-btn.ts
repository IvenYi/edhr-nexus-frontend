import {
  Platform,
  FormComponents,
  DisplayEnums,
  PropGroup,
  ButtonSize,
  StyleGroup,
  ButtonTypeGroup,
} from '/@page-designer/enum';
import { CardOpeBtn } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import commonStyle from '../../../common-config/common-style';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: CardOpeBtn = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.button',
  alias: '',
  display: DisplayEnums.INLINE_BLOCK,
  type: FormComponents.CardOpeBtn,
  icon: 'icon-Collapse',
  children: [],
  props: {
    disabled: false,
    icon: '',
    iconColor: '',
    /**标题 */
    title: '',
    /**二次确认 */
    confirm: false,
    confirmText: '',
    /**内置事件 */
    innerEvent: true,
    /**系统事件类型 */
    sysMethedType: undefined,
    linkPage: '',
    /**事件名称 */
    eventName: '',
    btnType: ButtonTypeGroup.TEXT,
    type: 'primary',
    danger: false,
    size: 'normal',
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'label',
    label: 'sys.pageDesigner.buttonName',
    group: PropGroup.BASIC,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
    },
    changeCallback: (widget, val) => {
      widget.alias = val;
      widget.props.label = val;
    },
  },
  {
    component: 'button-type-editor',
    name: { type: 'type', danger: 'danger', btnType: 'btnType' },
    label: 'sys.pageDesigner.buttonType',
    group: PropGroup.BUTTON,
  },
  {
    component: 'icon-editor',
    name: { icon: 'icon', iconColor: 'iconColor' },
    label: 'sys.pageDesigner.buttonIcon',
    group: PropGroup.BUTTON,
    _config: {
      showColor: true,
    },
  },
  {
    component: 'radio-editor',
    name: 'size',
    label: 'sys.pageDesigner.buttonType',
    group: PropGroup.BUTTON,
    _config: {
      options: Object.values(ButtonSize).map((i) => {
        return { value: i, label: 'sys.pageDesigner.' + i };
      }),
    },
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const designerConfig: LowCodeWidget.DesignerConfig = {
  basicProps: {
    key_label: 'sys.pageDesigner.button',
    alias_hidden: true,
  },
};
