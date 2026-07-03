import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { QuickSearch } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { FIELD_TYPE } from '@/enums/appEnum';
import { useScope } from '/@page-designer/hooks/useScope';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { has } from 'lodash-es';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: QuickSearch = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.search',
  alias: '',
  type: FormComponents.QuickSearch,
  icon: 'icon-sousuo',
  props: {
    placeholder: '${sys.pageDesigner.search}',
    model: undefined,
    searchField: [],
    scan: false,
    exp: '',
    customHeader: false,
    getFocus: false,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.SEARCH,
    required: true,
    changeCallback(widget: QuickSearch) {
      widget.props.searchField = [];
    },
    _config: {
      type: 'NDO,BASE',
    },
  },
  {
    component: 'input-attr-editor',
    name: '',
    label: 'sys.pageDesigner.inputAttr',
    group: PropGroup.SEARCH,
    _config: {
      needFieldAttrs: ['getFocus'],
      focusTips: 'sys.pageDesigner.getFocusTip2',
    },
    hidden: (widget) => {
      if (widget.props.hasOwnProperty('model')) {
        return !widget.props.model;
      }
      return false;
    },
    changeCallback(widget, value) {
      if (value.includes('getFocus')) {
        const { scopeData } = useScope();
        const fields = findNodeAll(scopeData.value, (res) => {
          return has(res.props, 'getFocus') && res.id !== widget.id;
        });
        fields.forEach((field) => {
          field.props.getFocus = false;
        });
      }
    },
  },
  {
    component: 'select-editor',
    name: 'searchField',
    label: 'sys.pageDesigner.quickSearchFields',
    group: PropGroup.SEARCH,
    required: true,
    _config: {
      multiple: true,
      maxMultiple: 5,
      tips: 'sys.pageDesigner.quickSearchTips',
      showSearch: true,
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
    component: 'switch-editor',
    name: 'scan',
    label: 'sys.pageDesigner.quickScanCode',
    group: PropGroup.SEARCH,
    hidden: (widget) => {
      if (widget.props.hasOwnProperty('model')) {
        return !widget.props.model;
      }
      return false;
    },
  },
  {
    component: 'text-editor',
    name: 'placeholder',
    label: 'sys.pageDesigner.fieldPlaceholder',
    group: PropGroup.SEARCH,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
    },
    hidden: (widget) => {
      if (widget.props.hasOwnProperty('model')) {
        return !widget.props.model;
      }
      return false;
    },
  },
  ...displayEditor,
  // {
  //   component: 'search-rule-editor',
  //   name: 'exp',
  //   label: '',
  //   group: PropGroup.ADVANCED,
  // },
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
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
    params: [],
  },
];

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
  // {
  //   component: 'font-editor',
  //   name: 'labelFont',
  //   label: 'sys.name',
  //   group: StyleGroup.STYLE,
  // },
  // {
  //   component: 'font-editor',
  //   name: 'contentFont',
  //   label: 'sys.content',
  //   group: StyleGroup.STYLE,
  // },
  // {
  //   component: 'boolean-editor',
  //   name: 'tagStyleOpen',
  //   label: 'sys.pageDesigner.tagStyle',
  //   group: StyleGroup.STYLE,
  //   _config: {
  //     showType: 'checkbox',
  //     options: [
  //       {
  //         label: 'sys.pageDesigner.configureContentAsLabelStyle',
  //         value: true,
  //       },
  //     ],
  //   },
  // },
  // {
  //   component: 'tag-editor',
  //   name: 'tagStyle',
  //   group: StyleGroup.STYLE,
  //   hidden: (widget) => {
  //     return !widget.style.tagStyleOpen;
  //   },
  // },
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

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
// export const styleEditorList: LowCodeWidget.StyleEditor[] = [
//   {
//     component: 'margin-editor',
//     group: StyleGroup.MARGIN,
//   },
// ];

const searchFieldType = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.SERIAL,
];
