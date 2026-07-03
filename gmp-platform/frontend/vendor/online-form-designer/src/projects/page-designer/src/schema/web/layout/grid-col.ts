import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { Grid, GridCol } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayProps, displayEditor } from '../../common-config/display-editor-config';
import { findClosestParent } from '/@/utils/helper/treeHelper';
import { useScope } from '/@page-designer/hooks/useScope';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: GridCol = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.gridchild',
  alias: '',
  type: FormComponents.GridCol,
  icon: 'icon-grid',
  internal: true,
  children: [],
  props: {
    /**占格 */
    span: 12,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'label-number-editor',
    name: 'span',
    // label: 'sys.pageDesigner.gridColWidth',
    label: '',
    group: PropGroup.COL_CONFIG,
    _config: {
      min: 1,
      max: 24,
      label: 'sys.pageDesigner.gridCol',
    },
    changeCallback(widget: GridCol, val: number) {
      const { scopeData } = useScope();
      const grid: Grid = findClosestParent(
        scopeData.value,
        widget.id,
        (widget: LowCodeWidget.BasicSchema) => {
          return widget.type === FormComponents.Grid;
        },
      );
      const index = grid.children.findIndex((d) => d.id === widget.id);
      grid.props.colSpan[index] = val;
    },
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'margin',
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

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
