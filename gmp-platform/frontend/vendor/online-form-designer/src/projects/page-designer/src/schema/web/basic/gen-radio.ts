import { Platform, PropGroup, FormComponents, StyleGroup, TagTypeEnum } from '/@page-designer/enum';
import { GenRadio } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor as editor, displayProps } from '../../common-config/display-editor-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: GenRadio = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.genRadio',
  alias: '',
  type: FormComponents.GenRadio,
  icon: 'icon-danxuankuang',
  props: {
    title: '${sys.pageDesigner.genRadio}',
    defaultValue: '',
    options: [],
    checked: '',
    disabled: false,
    displayLabelText: true,
    ...displayProps,
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
    group: PropGroup.GENRADIO,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
      formItemCheckbox: {
        label: 'sys.pageDesigner.displayLabelText',
        propsKey: 'displayLabelText'
      }
    },
  },
  {
    component: 'options-editor',
    name: 'options',
    label: '',
    group: PropGroup.GENRADIO,
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
    changeCallback: (widget, value) => {
      if (value && !widget.style.tagStyle) {
        widget.style.tagStyle = {
          color: '',
          tagType: TagTypeEnum.RADIUS,
        };
      }
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

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
