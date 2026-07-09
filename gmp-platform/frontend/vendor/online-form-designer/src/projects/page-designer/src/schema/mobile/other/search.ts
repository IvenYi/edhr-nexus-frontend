import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  mobileSearchListByFieldType,
} from '/@page-designer/enum';
import { Search } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { createdSearchField } from '/@page-designer/schema/utils';
import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';

//
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Search = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.query',
  alias: '',
  type: FormComponents.Search,
  icon: 'icon-chaxun1',
  children: [],
  props: {
    model: '',
    exp: '',
    customHeader: false,
    ...displayProps,
  },
  style: {},
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
      type: 'NDO,BASE,TREE',
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
          isFieldModel = false,
          fieldCodeChain,
        } = item;

        const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type)
          ? mappingType
          : type;
        return createdSearchField({
          field,
          fieldId,
          fieldType,
          fieldName,
          fieldCodeChain: fieldCodeChain || JSON.stringify({ modelKey: item.modelKey }),
          isFieldModel,
          bindModelKey,
          modelKey,
          refModelType,
          type,
          label: null,
          preLocation: widget.id,
        });
      },
      filterFn: (item) => {
        return (
          ([CreateType.USER_DEFINED, CreateType.BUILTIN].includes(item.createType) &&
            mobileSearchListByFieldType.includes(item.type) &&
            ![FIELD_TYPE.ONLINE_FORM_TEMPLATE, FIELD_TYPE.E_DHR_TEMPLATE].includes(item.type)) ||
          ([CreateType.SYSTEM].includes(item.createType as CreateType) &&
            [
              'create_user_id_',
              'create_time_',
              'modify_user_id_',
              'modify_time_',
              'create_org_id_',
              'modify_org_id_',
            ].includes(item.key ?? ''))
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
