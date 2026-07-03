import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { GenRadio } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

import { formItemProps } from '../../common-config/formItem-editor-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
// import { createWidgetByType } from '/@page-designer/schema/utils';
import { displayEditor as editor } from '../../common-config/display-editor-config';

export const widget: GenRadio = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.genCheckbox',
  alias: '',
  type: FormComponents.GenCheckbox,
  icon: 'icon-fuxuankuang',
  props: {
    title: '${sys.pageDesigner.genCheckbox}',
    defaultValue: '',
    required: false,
    bindModelKey: '',
    options: [],
    checked: [],
    disabled: false,
    displayLabelText: true,
    ...formItemProps,
  },
  style: {},
  events: {},
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.title',
    group: PropGroup.GENCHECKBOX,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
      formItemCheckbox: {
        label: 'sys.pageDesigner.displayLabelText',
        propsKey: 'displayLabelText',
      },
    },
  },
  {
    component: 'options-editor',
    name: 'options',
    label: '',
    group: PropGroup.GENCHECKBOX,
  },
  ...editor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'row'],
  },
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
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
  },
  {
    component: 'boolean-editor',
    name: 'tagStyleOpen',
    label: 'sys.pageDesigner.tagStyle',
    group: StyleGroup.STYLE,
    _config: {
      showType: 'checkbox',
      options: [
        {
          label: 'sys.pageDesigner.configureContentAsLabelStyle',
          value: true,
        },
      ],
    },
  },
  {
    component: 'tag-editor',
    name: 'tagStyle',
    group: StyleGroup.STYLE,
    hidden: (widget) => {
      return !widget.style.tagStyleOpen;
    },
  },
  {
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
  {
    component: 'border-radius-editor',
    group: StyleGroup.BORDER,
  },
  {
    component: 'border-editor',
    group: StyleGroup.BORDER,
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
