import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { SelectSearch } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { CreateType, FIELD_TYPE, MaterialEnum } from '@/enums/appEnum';
import { beginDrag } from '/@page-designer/schema/utils';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: SelectSearch = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.searchSelectComp',
  alias: '',
  type: FormComponents.SelectSearch,
  icon: 'icon-sousuo',
  children: [],
  props: {
    model: undefined,
    multiple: true,
    quickSearchFields: [],
    searchResultFields: [],
    placeholder: '${sys.pageDesigner.search}',
    ...displayProps,
  },
  i18n: {},
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
    group: PropGroup.SEARCH,
    required: true,
    changeCallback(widget: SelectSearch) {
      widget.children = [];
      widget.props.quickSearchFields = [];
      widget.props.searchResultFields = [];
    },
    _config: {
      type: 'NDO,BASE',
    },
  },
  {
    component: 'select-editor',
    name: 'quickSearchFields',
    label: 'sys.pageDesigner.quickSearchFields',
    group: PropGroup.SEARCH,
    required: true,
    _config: {
      showSearch: true,
      multiple: true,
      maxMultiple: 5,
      tips: 'sys.pageDesigner.quickSearchTips',
      options: async (widget) => {
        if (widget.props.model) {
          const data = await getFieldMetaList({ modelKey: widget.props.model });
          return data
            ?.filter((e) => searchFieldType.some((f) => f === e.type))
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        }
        return [];
      },
    },
    dependentProps: ['model'],
  },
  {
    component: 'select-editor',
    name: 'searchResultFields',
    label: 'sys.pageDesigner.searchResultFields',
    group: PropGroup.SEARCH,
    required: true,
    changeCallback: async (widget) => {
      const fieldData = (await getFieldMetaList({ modelKey: widget.props.model })) || [];
      widget.children = [];
      widget.props.searchResultFields.forEach((e) => {
        const field: any = fieldData.filter((f) => f.key === e)[0] || {};
        const comp = beginDrag(field, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        widget.children.push(comp);
      });
    },
    _config: {
      showSearch: true,
      multiple: true,
      tips: 'sys.pageDesigner.searchResultTips',
      options: async (widget) => {
        if (widget.props.model) {
          const data = await getFieldMetaList({ modelKey: widget.props.model });
          return data
            ?.filter(
              (e) =>
                (resultFieldType.some((f) => f === e.type) &&
                  [CreateType.BUILTIN, CreateType.USER_DEFINED].includes(e.createType)) ||
                resultFieldType_sys.some((f) => f === e.key),
            )
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        }
        return [];
      },
    },
    dependentProps: ['model'],
  },
  {
    component: 'text-editor',
    name: 'placeholder',
    label: 'sys.pageDesigner.fieldPlaceholder',
    group: PropGroup.SEARCH,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 10,
    },
    dependentProps: ['model'],
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeSearch',
    title: 'sys.pageDesigner.beforeSearch',
    params: ['value', 'data'],
  },
  {
    name: 'afterSearch',
    title: 'sys.pageDesigner.afterSearch',
    params: ['value', 'data'],
  },
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
    params: [],
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

export const searchFieldType = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.SERIAL,
];

export const resultFieldType = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.TIME,
  // FIELD_TYPE.IMAGE,
  // FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.SERIAL,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.RDO_REF,
];

export const resultFieldType_sys = [
  'create_time_',
  'create_user_id_',
  'create_org_id_',
  'modify_org_id_',
  'modify_time_',
  'modify_user_id_',
  'parent_id_',
];
