import {
  Platform,
  PropGroup,
  FormComponents,
  sortTypeEnum,
  StyleGroup,
} from '/@page-designer/enum';
import { DataList } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { CreateType } from '@/enums/appEnum';
import { EntityModelTypeEnum } from '/@app-designer/enum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: DataList = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.dataList',
  alias: '',
  type: FormComponents.RdoDataList,
  icon: 'icon-RDOliebiao',
  props: {
    model: '',
    title: '${sys.pageDesigner.dataList}',
    showSearch: false,
    refSearch: '',
    showPagination: true,
    pageSize: 20,
    searchMedthod: '',
    searchPlaceholder: '${sys.inputText}',
    collation: [
      {
        collationField: 'create_time_',
        collationSort: sortTypeEnum.DESC,
      },
    ],
    showMedthod: '',
    showField: 'name_',
    showRule: '',
    datafilter: [],
    maxRows: 1,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};
export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.title',
    group: PropGroup.LIST,
    _config: {
      i18n: true,
    },
  },
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.LIST,
    required: true,
    _config: {
      type: [EntityModelTypeEnum.RDO, EntityModelTypeEnum.WORKFLOW].join(','),
    },
  },
  {
    component: 'switch-editor',
    name: 'showSearch',
    label: 'sys.pageDesigner.search',
    group: PropGroup.LIST,
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'text-editor',
    name: 'searchPlaceholder',
    label: 'sys.pageDesigner.searchPlaceholder',
    group: PropGroup.LIST,
    required: true,
    hidden(widget) {
      return !widget.props.showSearch;
    },
  },
  {
    component: 'max-rows-editor',
    name: 'maxRows',
    label: 'sys.pageDesigner.contentMaxRows',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'switch-editor',
    name: 'showPagination',
    label: 'sys.pageDesigner.pagination',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'page-editor',
    name: 'pageSize',
    label: '',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model || !widget.props.showPagination;
    },
  },
  {
    component: 'data-filtering-new-editor',
    label: '',
    name: 'datafilter',
    group: PropGroup.LISTDATA,
    dependentProps: ['model'],
    _config: {
      modelKey: 'model',
    },
  },
  {
    component: 'sorts-editor',
    label: '',
    name: 'collation',
    group: PropGroup.LISTDATA,
    dependentProps: ['model'],
    _config: {
      filterTypes: [CreateType.BUILTIN, CreateType.SYSTEM],
    },
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'cellClickEvent',
    title: 'sys.pageDesigner.rowClickEvent',
    params: ['node'],
  },
];

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
