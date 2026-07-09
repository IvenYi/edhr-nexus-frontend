import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  tabsTypeENUM,
  StyleGroup,
} from '/@page-designer/enum';
import { Tabs } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';

import { createWidgetByType } from '/@page-designer/schema/utils';
import { useAppInfoStore } from '/@/store/modules/app-info';

export const widget: Tabs = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.tabControl',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.Tabs,
  icon: 'icon-biaoqianye',
  children: [],
  props: {
    type: tabsTypeENUM.LINE,
    tabBarGutter: 8,
    tabBarGutterLine: 20,
    centered: false,
    destroyInactiveTabPane: false,
    customConfig: [],
    defaultTag: '',
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'tabs-editor',
    name: 'defaultTag',
    label: '',
    group: PropGroup.OPTIONS,
    _config: {
      eventCallback(widget: Tabs) {
        const w = createWidgetByType(FormComponents.TabPane);
        widget.children.push(w);
      },
    },
  },
  {
    component: 'radio-bgc-editor',
    name: 'type',
    label: 'sys.pageDesigner.labeltype',
    group: PropGroup.OPTIONS,
    _config: {
      options: Object.values(tabsTypeENUM).map((key) => {
        return { value: key, label: `sys.pageDesigner.${key === 'line' ? 'basic' : key}` };
      }),
      filterFn: (list) => {
        const { appInfo } = useAppInfoStore();
        if (appInfo?.suiteKey !== 'MEDPRO') {
          return list.filter((op) => op.value !== tabsTypeENUM.CUSTOM);
        }
        return list;
      },
    },
  },
  {
    component: 'custom-tab-editor',
    name: 'customConfig',
    label: '自定义图标',
    group: PropGroup.OPTIONS,
    hidden: (widget) => widget.props.type !== tabsTypeENUM.CUSTOM,
  },
  {
    component: 'number-editor',
    name: 'tabBarGutter',
    label: 'sys.pageDesigner.tabMargin',
    group: PropGroup.OPTIONS,
    _config: {
      isInRow: true,
      addonAfter: 'px',
      max: 500,
      min: 0,
    },
    hidden: (widget) => {
      return ![tabsTypeENUM.CARD, tabsTypeENUM.CUSTOM].includes(widget.props.type);
    },
  },
  {
    component: 'number-editor',
    name: 'tabBarGutterLine',
    label: 'sys.pageDesigner.tabMargin',
    group: PropGroup.OPTIONS,
    _config: {
      isInRow: true,
      addonAfter: 'px',
      max: 500,
      min: 0,
    },
    hidden: (widget) => {
      return widget.props.type !== tabsTypeENUM.LINE;
    },
  },
  {
    component: 'switch-editor',
    name: 'centered',
    label: 'sys.pageDesigner.centered',
    group: PropGroup.OPTIONS,
  },
  {
    component: 'switch-editor',
    name: 'destroyInactiveTabPane',
    label: 'sys.pageDesigner.destroyInactiveTabPane',
    group: PropGroup.OPTIONS,
    _config: {
      tooltip: 'sys.pageDesigner.destroyInactiveTabPane_tip',
    },
  },

  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
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

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'afterActivatingTheTab',
    title: 'sys.pageDesigner.afterActivatingTheTab',
    params: ['tabIndex'],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (widget: Tabs) => {
  const w = createWidgetByType(FormComponents.TabPane);
  widget.children.push(w);
  widget.props.defaultTag = w.id;
};
