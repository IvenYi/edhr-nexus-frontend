import { Platform, COLUMNS_TYPE, FormComponents } from '/@page-designer/enum';
import { LayoutColumns } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LayoutColumns = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.TopLayoutThree',
  alias: '',
  type: FormComponents.TopLayoutThree,
  icon: 'icon-sanfenlan-xia',
  internal: true,
  children: [
    { label: '上栏', children: [], position: 'top' },
    { label: '左栏', children: [], position: 'left' },
    { label: '右栏', children: [], position: 'right' },
  ],
  props: {
    columnresize: false,
    columnputAway: false, //侧栏收起
    columnheight: 200, //侧栏宽度
    columntype: COLUMNS_TYPE.LEFT, //left center right
    defaultColumnputAway: false,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};
export const propEditorList: LowCodeWidget.PropEditor[] = [...displayEditor];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
