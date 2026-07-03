// import { BaseButtonProps } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import {
  PropGroup,
  ButtonSize,
  ButtonType,
  ButtonStyle,
  operateSysEnums,
} from '/@page-designer/enum';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';

export interface BaseButtonProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  refForm?: string;
  /**
   * 关联列表
   */
  refList?: string;
  /**标题 */
  title: string;
  /**二次确认 */
  confirm?: boolean;
  confirmText?: string;
  /**内置事件 */
  innerEvent?: boolean;
  /**系统事件类型 */
  sysMethedType?: operateSysEnums;
  linkPage?: string;
  /**事件名称 */
  eventName?: string;
  /**显示规则 */
  // displayRule?: string;
  icon: string;
  iconColor: string;
  size: ButtonSize;
  disabled: boolean;
  // btnType: ButtonTypeGroup;
  /**是否显示按钮名称 */
  hasText: boolean;
  /**是否显示图标 */
  hasIcon: boolean;
  /**按钮type */
  type: string;
  /**是否是危险类型 */
  danger: boolean;
  /**关联模型 */
  model?: string;
  i18nConfig?: string;
  //**按钮样式 */
  buttonStyle?: ButtonStyle;
  enableCustomColor: boolean;
  backgroundColor?: string;
  fontColor?: string;
}
export const baseBtnProp: BaseButtonProps = {
  disabled: false,
  icon: 'icon-park:all-application',
  iconColor: '',
  /**标题 */
  title: '${sys.pageDesigner.button}',
  buttonStyle: ButtonStyle.ORDINARY,
  /**二次确认 */
  confirm: false,
  confirmText: '',
  // /**内置事件 */
  // innerEvent: true,
  /**系统事件类型 */
  // sysMethedType: undefined,
  // linkPage: '',
  /**事件名称 */
  // eventName: '',
  hasIcon: false,
  hasText: true,
  type: ButtonType.PRIMARY,
  danger: false,
  size: ButtonSize.DEFAULT,
  enableCustomColor: false,
  backgroundColor: '',
  fontColor: '',
  ...displayProps,
};

export const baseBtnEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.buttonName',
    group: PropGroup.BASIC,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
    },
    changeCallback: (widget, val) => {
      widget.alias = val;
    },
  },
  {
    component: 'button-type-editor',
    name: {
      type: 'type',
      danger: 'danger',
      icon: 'icon',
      label: 'label',
      hasText: 'hasText',
      hasIcon: 'hasIcon',
    },
    label: 'sys.pageDesigner.buttonType',
    group: PropGroup.BUTTON,
  },
  {
    component: 'icon-editor',
    name: { icon: 'icon', iconColor: 'iconColor' },
    label: 'sys.pageDesigner.buttonIcon',
    group: PropGroup.BUTTON,
    // _config: {
    //   showColor: true,
    // },
    hidden: (widget) => {
      return !widget.props.hasIcon;
    },
  },
  {
    component: 'radio-bgc-editor',
    name: 'size',
    label: 'sys.pageDesigner.buttonSize',
    group: PropGroup.BUTTON,
    _config: {
      options: Object.values(ButtonSize).map((i) => {
        return { value: i, label: 'sys.pageDesigner.' + i };
      }),
    },
  },
];
