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
import { CreateType, FIELD_TYPE } from '@/enums/appEnum';
import { EntityModelTypeEnum, EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: DataList = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.dataList',
  alias: '',
  type: FormComponents.DataList,
  icon: 'icon-list',
  props: {
    model: undefined,
    modeldata: {},
    title: '${sys.pageDesigner.dataList}',
    showSearch: false,
    refSearch: '',
    showPagination: true,
    pageSize: 20,
    searchField: [],
    searchMedthod: '',
    searchPlaceholder: '${sys.searchText}',
    collation: [],
    showMedthod: '',
    showField: '',
    showRule: '',
    datafilter: [],
    defaultExpandLevel: 2,
    maxRows: 1,
    showFieldExp: false,
    showFieldExpVal: '',
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
      type: 'NDO,BASE,TREE',
      subModel: 0,
      category: 'entity,data,view',
    },
    changeCallback(widget: DataList) {
      widget.props.searchField = [];
      widget.props.showFieldExp = false;
      widget.props.showField = '';
      widget.props.showFieldExpVal = '';
      widget.props.showSearch = false;
      widget.props.datafilter = [];
      widget.props.collation = [
        {
          collationField:
            widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
              ? undefined
              : 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ];
    },
  },
  {
    component: 'field-editor',
    name: 'showField',
    label: 'sys.pageDesigner.showField',
    group: PropGroup.LIST,
    required: true,
    dependentProps: ['model'],
    hidden(widget) {
      return widget.props.showFieldExp;
    },
    _config: {
      labelButton: {
        icon: 'icon-HTML',
        label: 'sys.pageDesigner.showField',
        size: 14,
        tooltip: '编辑表达式',
        clickFn: (widget) => {
          widget.props.showFieldExp = true;
        },
      },
      filterFields: [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.TEXT],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
    },
  },
  {
    component: 'exp-editor',
    name: 'showFieldExpVal',
    label: 'sys.pageDesigner.showField',
    group: PropGroup.LIST,
    required: true,
    dependentProps: ['model'],
    hidden(widget) {
      return !widget.props.showFieldExp;
    },
    _config: {
      labelButton: {
        icon: 'icon-HTML',
        label: 'sys.pageDesigner.showField',
        type: 'primary',
        size: 14,
        tooltip: '编辑表达式',
        clickFn: (widget) => {
          widget.props.showFieldExp = false;
        },
      },
      filterFields: [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.TEXT],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
    },
  },
  {
    component: 'switch-editor',
    name: 'showSearch',
    label: 'sys.pageDesigner.search',
    group: PropGroup.LIST,
    dependentProps: ['model'],
  },
  {
    component: 'field-editor',
    name: 'searchField',
    label: 'sys.pageDesigner.searchField',
    group: PropGroup.LIST,
    required: true,
    hidden(widget) {
      return !widget.props.showSearch;
    },
    _config: {
      filterFields: [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.TEXT],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      multiple: true,
    },
  },
  {
    component: 'text-editor',
    name: 'searchPlaceholder',
    label: 'sys.pageDesigner.fieldPlaceholder',
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
      return (
        !widget.props.model ||
        widget.props.modelType === EntityModelTypeEnum.TREE ||
        widget.props?.modeldata?.modelType === EntityModelTypeEnum.TREE
      );
    },
  },
  {
    component: 'page-editor',
    name: 'pageSize',
    label: '',
    group: PropGroup.SHOW,
    hidden(widget) {
      return (
        !widget.props.model ||
        !widget.props.showPagination ||
        widget.props.modelType === EntityModelTypeEnum.TREE ||
        widget.props?.modeldata?.modelType === EntityModelTypeEnum.TREE
      );
    },
  },
  {
    component: 'default-expand-editor',
    name: 'defaultExpandLevel',
    label: 'sys.pageDesigner.defaultExpandLevel',
    group: PropGroup.SHOW,
    hidden(widget) {
      console.log('widget', widget);
      const isTree =
        widget.props.modelType === EntityModelTypeEnum.TREE ||
        widget.props?.modeldata?.modelType === EntityModelTypeEnum.TREE;
      return !widget.props.model || !isTree;
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
