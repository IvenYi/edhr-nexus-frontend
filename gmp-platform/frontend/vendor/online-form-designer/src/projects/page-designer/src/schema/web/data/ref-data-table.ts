import { RefDataTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FormComponents, PropGroup, StyleGroup } from '/@page-designer/enum';
import {
  widget as tableWidget,
  eventList as tableEvent,
  propEditorList as tableProp,
  beforeCreate as tableBeforeCreate,
} from './data-table/data-table';
import { TableTypeEnum } from '@gct/runtime';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<RefDataTable, 'children'> = {
  ...tableWidget,
  name: 'sys.pageDesigner.refdataTable',
  alias: '',
  type: FormComponents.RefDataTable,
  icon: 'icon-guanlianshujubiao',
  props: {
    ...tableWidget.props,
    refField: '',
    /**关联类型 */
    refType: 'form',
    refForm: '',
  },
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.BASIC,
    required: true,
    changeCallback(widget: RefDataTable) {
      widget.props.refSearch = '';
      widget.children![0].children.splice(0);
      widget.children![1].children.splice(0);
      widget.children![2].children.splice(0);
      widget.children![3].children.splice(0);
      widget.children[4].children.splice(0);
      widget.props.subModel = null;
      widget.props.subModelField = null;
      widget.props.subModelData = {};
      widget.props.gridType = TableTypeEnum.DEFAULT;
    },
    _config: {
      subModel: 0,
      category: 'entity,data,view',
      type: 'NDO,BASE,TREE,TRANSACTION,SIGN,CHECK_LIST,TXN_EXT',
    },
  },
  {
    component: 'button-refField-editor',
    name: 'refField',
    label: 'sys.pageDesigner.associatedFields',
    group: PropGroup.BASIC,
    required: true,
    dependentProps: ['model'],
  },
  ...tableProp.slice(1),
];

export const eventList: LowCodeWidget.EventsType[] = [...tableEvent];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const beforeCreate = tableBeforeCreate;
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'table-height-editor',
    name: { number: 'tableheight', type: 'tableheightConfigure' },
    label: '',
    group: StyleGroup.SHOW_PROP,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];
