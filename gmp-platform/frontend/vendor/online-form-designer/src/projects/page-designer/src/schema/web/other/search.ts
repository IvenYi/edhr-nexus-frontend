import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  searchListByFieldType,
} from '/@page-designer/enum';
import { Search } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { AGLINE_ENUMS } from '@/enums/designEnum';
import { createdSearchField } from '/@page-designer/schema/utils';
import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
//
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Search = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.query',
  alias: '',
  type: FormComponents.Search,
  icon: 'icon-chaxun1',
  children: [],
  props: {
    model: undefined,
    /**最多显示个数 */
    maxLength: 10,
    /**单行显示个数 */
    rowLength: 2,
    /**对其方式 */
    alignment: AGLINE_ENUMS.RIGHT,
    exp: '',
    customHeader: false,
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  // 关联模型
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.QUERY,
    required: true,
    changeCallback(widget: Search) {
      widget.children = [];
    },
    _config: {
      type: 'NDO,BASE,TREE,RDO,WORKFLOW,CHECK_LIST', // 新版edhr需要
      category: 'entity,data,view',
    },
  },
  // 筛选项
  {
    component: 'field-list-editor',
    name: 'root:children',
    label: 'sys.pageDesigner.filterItems',
    group: PropGroup.QUERY,
    _config: {
      cascadeField: true,
      createField: (item, widget) => {
        const {
          key: field,
          id: fieldId,
          type,
          name: fieldName,
          bindInfo: bindModelKey,
          modelKey,
          mappingType,
          refModelType,
          modelCategory,
          modelType,
          isFieldModel = false,
          fieldCodeChain,
        } = item;
        const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type)
          ? mappingType
          : type;
        const label = null;
        return createdSearchField({
          field,
          fieldId,
          fieldType,
          label,
          fieldName,
          fieldCodeChain: fieldCodeChain || JSON.stringify({ modelKey: item.modelKey }),
          isFieldModel,
          bindModelKey,
          modelKey,
          refModelType,
          type,
          preLocation: widget.id,
          modelCategory,
          modelType,
        });
      },
      filterFn: (item) => {
        return (
          [CreateType.USER_DEFINED, CreateType.BUILTIN, CreateType.SYSTEM].includes(
            item.createType,
          ) && searchListByFieldType.includes(item.type)
        );
      },
    },
    dependentProps: ['model'],
  },
  // 查询规则
  {
    component: 'search-rule-editor',
    name: 'exp',
    label: 'sys.pageDesigner.queryRules',
    group: PropGroup.QUERY,
    dependentProps: ['model'],
  },
  // 单行显示个数
  {
    component: 'number-editor',
    name: 'rowLength',
    label: 'sys.pageDesigner.NumberOfSingleLineDisplays',
    group: PropGroup.SHOW,
    formItemClass: 'in-row-editor',
    _config: {
      min: 1,
      max: 5,
    },
    dependentProps: ['model'],
  },
  // 最多显示个数
  {
    component: 'number-editor',
    name: 'maxLength',
    label: 'sys.pageDesigner.MaximumNumberOfDisplays',
    group: PropGroup.SHOW,
    formItemClass: 'in-row-editor',
    _config: {
      min: 1,
      max: 20,
    },
    dependentProps: ['model'],
  },
  // 按钮对齐方式
  {
    component: 'align-editor',
    name: 'alignment',
    label: 'sys.pageDesigner.buttonAlignment',
    group: PropGroup.SHOW,
    _config: {
      options: [
        { label: AGLINE_ENUMS.LEFT, value: 'icon-zuoduiqi1' },
        { label: AGLINE_ENUMS.CENTER, value: 'icon-juzhongduiqi1' },
        { label: AGLINE_ENUMS.RIGHT, value: 'icon-youduiqi1' },
      ],
    },
    dependentProps: ['model'],
  },
  // 自定义筛选项
  {
    component: 'switch-editor',
    name: 'customHeader',
    label: 'sys.pageDesigner.customFilterItems',
    group: PropGroup.SHOW,
    dependentProps: ['model'],
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeSearch',
    title: 'sys.pageDesigner.beforeSearch',
    params: ['queryData'],
  },
  {
    name: 'afterSearch',
    title: 'sys.pageDesigner.afterSearch',
    params: ['queryData'],
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
