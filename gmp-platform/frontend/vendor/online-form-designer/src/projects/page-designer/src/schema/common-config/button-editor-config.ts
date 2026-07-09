import { ButtonBasicProps } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import {
  PropGroup,
  ButtonColorType,
  ButtonColorTheme,
  ButtonStyle,
  ButtonSize,
  StyleGroup,
  Platform,
} from '/@page-designer/enum';
import { hiddenButtonProps } from './button-props-func';
import { platform } from '../../hooks/usePage';

export const buttonProps: ButtonBasicProps = {
  disabled: false,
  buttonTheme: ButtonColorTheme.DEFAULT,
  buttonType: ButtonColorType.DEFAULT,
  icon: '',
  iconColor: '',
  buttonStyle: ButtonStyle.ORDINARY,
  enableCustomColor: false,
  backgroundColor: '',
  fontColor: '',
};

export const buttonEditor: LowCodeWidget.PropEditor[] = [
  // {
  //   component: 'switch-editor',
  //   name: 'disabled',
  //   label: 'sys.pageDesigner.disabled',
  //   group: PropGroup.DISPLAY,
  //   hidden: (widget): boolean => {
  //     return hiddenButtonProps(widget);
  //   },
  // },
  // {
  //   component: 'radio-editor',
  //   name: 'basic.buttonType',
  //   label: 'sys.pageDesigner.buttonType',
  //   group: PropGroup.ButtonStyle,
  //   _config: {
  //     options: Object.values(ButtonColorType).map((i) => {
  //       return { value: i, label: 'sys.pageDesigner.' + i };
  //     }),
  //   },
  //   hidden: (widget): boolean => {
  //     return hiddenButtonProps(widget);
  //   },
  // },
  // {
  //   component: 'radio-editor',
  //   name: 'buttonStyle',
  //   label: 'sys.pageDesigner.buttonStyle',
  //   group: PropGroup.ButtonStyle,
  //   hidden: (widget): boolean => {
  //     return hiddenButtonProps(widget) || platform.value === Platform.MOBILE;
  //   },
  //   _config: {
  //     options: Object.values(ButtonStyle).map((key) => {
  //       return { label: 'sys.pageDesigner.' + key, value: key };
  //     }),
  //   },
  // },

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
    group: PropGroup.ButtonStyle,
    hidden: (widget): boolean => {
      return hiddenButtonProps(widget);
    },
  },
  {
    component: 'icon-editor',
    name: { icon: 'icon', iconColor: 'iconColor' },
    label: 'sys.pageDesigner.buttonIcon',
    group: PropGroup.ButtonStyle,
    hidden: (widget) => {
      return !widget.props.hasIcon || hiddenButtonProps(widget);
    },
    _config: {
      clearable: false,
    },
  },
  {
    component: 'switch-editor',
    name: 'enableCustomColor',
    label: 'sys.pageDesigner.customBtnColor',
    group: PropGroup.ButtonStyle,
    hidden: (widget) => {
      return hiddenButtonProps(widget);
    },
  },
  {
    component: 'button-color-editor',
    name: 'fontColor',
    label: 'sys.pageDesigner.buttonNameColor',
    group: PropGroup.ButtonStyle,
    _config: {
      isInRow: true,
    },
    hidden: (widget) => {
      return !widget.props.enableCustomColor;
    },
  },
  {
    component: 'button-color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.buttonStyleColor',
    group: PropGroup.ButtonStyle,
    _config: {
      isInRow: true,
    },
    hidden: (widget) => {
      return !widget.props.enableCustomColor || widget.props.type === 'link';
    },
  },
  {
    component: 'radio-bgc-editor',
    name: 'size',
    label: 'sys.pageDesigner.buttonSize',
    group: PropGroup.ButtonStyle,
    hidden: (widget): boolean => {
      return hiddenButtonProps(widget) || platform.value === Platform.MOBILE;
    },
    _config: {
      options: Object.values(ButtonSize).map((i) => {
        return { value: i, label: 'sys.pageDesigner.' + i };
      }),
    },
  },
  {
    component: 'switch-editor',
    name: 'confirm',
    label: 'sys.pageDesigner.confirm',
    group: PropGroup.ButtonStyle,
    hidden: (widget): boolean => {
      return hiddenButtonProps(widget);
    },
    _config: {
      tooltip: 'sys.pageDesigner.buttonConfirm',
    },
  },
  {
    component: 'texteare-editor',
    name: 'confirmText',
    label: 'sys.pageDesigner.regHint',
    group: PropGroup.ButtonStyle,
    _config: {
      i18n: true,
      placeholder: 'sys.pageDesigner.confirmTodo',
    },
    hidden: (widget): boolean => {
      return !widget.props.confirm || hiddenButtonProps(widget);
    },
  },
  // {
  //   component: 'select-editor',
  //   name: 'basic.buttonTheme',
  //   label: 'sys.pageDesigner.buttonTheme',
  //   group: PropGroup.ButtonStyle,
  //   _config: {
  //     options: Object.values(ButtonColorTheme).map((i) => {
  //       return { value: i, label: 'sys.pageDesigner.' + i };
  //     }),
  //   },
  //   hidden: (widget): boolean => {
  //     return hiddenButtonProps(widget);
  //   },
  // },
  // {
  //   component: 'icon-editor',
  //   name: { icon: 'basic.icon', iconColor: 'basic.iconColor' },
  //   label: 'sys.pageDesigner.icon',
  //   group: PropGroup.ButtonStyle,
  //   _config: {
  //     showColor: true,
  //   },
  //   hidden: (widget): boolean => {
  //     return hiddenButtonProps(widget);
  //   },
  // },
];

export const buttonStyleEditor: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
    // 按钮容器中的按钮不需要样式属性
    hidden: (widget) => {
      return !!widget.props.parentWidgetId || widget.preLocation;
    },
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    // 按钮容器中的按钮不需要样式属性
    hidden: (widget) => {
      return !!widget.props.parentWidgetId || widget.preLocation;
    },
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
  },
];
