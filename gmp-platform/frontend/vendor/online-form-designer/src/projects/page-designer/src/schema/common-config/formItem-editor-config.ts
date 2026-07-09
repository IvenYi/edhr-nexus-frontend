import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { PropGroup, Platform } from '/@page-designer/enum';
import { displayEditor as editor, displayProps } from './display-editor-config';

export const formItemProps: LowCodeWidget.FormItemProps = {
  field: '',
  fieldId: '',
  label: '',
  modelKey: '',
  fieldType: undefined,
  bindModelKey: undefined,
  disabled: false,
  explain: '',
  showExplain: false,
  displayLabelText: true,
  readonly: false,
  fieldReadonly: false,
  notSubmitInHide: true,
  ...displayProps,
};

export const displayEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'switch-editor',
    name: 'showExplain',
    label: 'sys.pageDesigner.explain',
    group: PropGroup.BASIC,
    hidden: (widget) => {
      return widget.platform === Platform.MOBILE;
    },
  },
  {
    component: 'texteare-editor',
    name: 'explain',
    label: '',
    group: PropGroup.BASIC,
    hidden: (widget) => {
      return !widget.props.showExplain;
    },
    _config: {
      i18n: true,
    },
  },
  {
    component: 'switch-editor',
    name: 'displayLabelText',
    label: 'sys.pageDesigner.displayLabelText',
    group: PropGroup.ADVANCED,
  },
  {
    component: 'switch-editor',
    name: 'disabled',
    label: 'sys.pageDesigner.disabled',
    group: PropGroup.ADVANCED,
  },
  {
    component: 'switch-editor',
    name: 'readonly',
    label: 'sys.pageDesigner.readonly',
    group: PropGroup.ADVANCED,
  },
  ...editor,
  // {
  //   component: 'switch-editor',
  //   name: 'notSubmitInHide',
  //   label: 'sys.pageDesigner.notSubmitInHide',
  //   group: PropGroup.DISPLAY,
  // },
];
