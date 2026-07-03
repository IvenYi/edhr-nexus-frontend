import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { Text } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Text = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.text',
  alias: '',
  type: FormComponents.Text,
  icon: 'icon-wenben1',
  props: {
    text: '',
    i18nConfig: '',
    ...displayProps,
  },
  style: {},
  events: {},
  i18n: {},
  formItem: false,
  ignoringStyle: [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderLeft',
    'borderRight',
    'borderBottom',
    'borderTop',
    'borderTopRightRadius',
    'borderTopLeftRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius',
    'backgroundColor',
  ],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'texteare-editor',
    name: 'text',
    label: 'sys.pageDesigner.text',
    group: PropGroup.TEXT,
    _config: {
      i18n: true,
      placeholder: 'sys.pageDesigner.pleaseInputText',
    },
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'font-editor',
    name: 'contentFont',
    label: '',
    group: StyleGroup.STYLE,
    _config: {
      label: 'sys.pageDesigner.character',
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
