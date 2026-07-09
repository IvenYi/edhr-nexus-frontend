import {
  Platform,
  COLUMNS_TYPE,
  FormComponents,
  PropGroup,
  StyleGroup,
} from '/@page-designer/enum';
import { LayoutColumns } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LayoutColumns = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.LeftRightColumns',
  alias: '',
  type: FormComponents.LeftRightColumns,
  icon: 'icon-zuoce',
  children: [
    { label: '左栏', alias: '左分栏', children: [], position: 'left' },
    { label: '右栏', alias: '右分栏', children: [], position: 'right' },
  ],
  props: {
    rowresize: false, //侧栏调节
    rowputAway: false, //侧栏收起
    rowwidth: 450, //侧栏宽度
    rowtype: COLUMNS_TYPE.LEFT, //left center right
    defaultRowputAway: false,
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
  ignoringStyle: [],
};
export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'radio-icon-editor',
    name: 'rowtype',
    label: 'sys.pageDesigner.ColumnSplittingMethod',
    group: PropGroup.LEFT_RIGHT_COLUMNS,
    _config: {
      options: [
        {
          icon: 'gct-iconfont icon-peizhi-zuofen',
          value: COLUMNS_TYPE.LEFT,
        },
        {
          icon: 'gct-iconfont icon-peizhi-junfen',
          value: COLUMNS_TYPE.CENTER,
        },
        {
          icon: 'gct-iconfont icon-peizhi-youfen',
          value: COLUMNS_TYPE.RIGHT,
        },
      ],
    },
  },
  {
    component: 'number-editor',
    name: 'rowwidth',
    label: 'sys.pageDesigner.initialWidthOfSidebar',
    group: PropGroup.LEFT_RIGHT_COLUMNS,
    hidden(widget: LayoutColumns) {
      return widget.props.rowtype === COLUMNS_TYPE.CENTER;
    },
    _config: {
      addonAfter: 'px',
      min: 100,
      max: 1000,
    },
  },
  {
    component: 'switch-editor',
    name: 'rowresize',
    label: 'sys.pageDesigner.rowresize',
    group: PropGroup.LEFT_RIGHT_COLUMNS,
  },
  {
    component: 'column-editor',
    name: { support: 'rowputAway', defaultFold: 'defaultRowputAway' },
    label: 'sys.pageDesigner.supportCollapsed',
    group: PropGroup.LEFT_RIGHT_COLUMNS,
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
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
