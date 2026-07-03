import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  sortTypeEnum,
  tableColumnWidthEnum,
} from '/@page-designer/enum';
import { TreeTableMobile } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { MaterialEnum, selectionTypeEnums } from '/@/enums/appEnum';

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<TreeTableMobile, 'children'> = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.treeTable',
  alias: '',
  type: FormComponents.TreeTable,
  icon: 'icon-shuxingbiaoge',
  children: [],
  props: {
    model: undefined,
    refSearch: '',
    initializeLoad: true,
    datafilter: [],
    collation: [
      {
        collationField: 'create_time_',
        collationSort: sortTypeEnum.DESC,
      },
    ],
    rowdraggable: false,
    serialNumber: true,
    defaultExpandLevel: 2,
    rowSelection: false,
    rowSelectionType: selectionTypeEnums.SingleChoice,
    ...displayProps,
  },
  style: {
    tableheight: 300,
    tableheightConfigure: undefined,
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.Table,
    required: true,
    changeCallback(widget: TreeTableMobile) {
      widget.props.refSearch = '';
      widget.children = [];
    },
    _config: {
      type: 'TREE',
      category: 'entity',
    },
  },
  {
    component: 'select-editor',
    name: 'refSearch',
    label: 'sys.pageDesigner.refQuerySearch',
    group: PropGroup.Table,
    dependentProps: ['model'],
    _config: {
      options: () => {
        const { getWidgetByScope } = useDesigner();
        return [
          ...getWidgetByScope(FormComponents.Search),
          ...getWidgetByScope(FormComponents.QuickSearch),
        ].map((i) => {
          return { label: `${t(i.name)} ${i.id}`, value: i.id };
        });
      },
    },
  },
  {
    component: 'switch-editor',
    name: 'initializeLoad',
    label: 'sys.pageDesigner.initializeLoad',
    dependentProps: ['model'],
    group: PropGroup.Table,
  },
  {
    component: 'switch-editor',
    name: 'rowSelection',
    label: 'sys.pageDesigner.rowSelection',
    group: PropGroup.Table,
    hidden(widget) {
      return !widget.props.model;
    },
    changeCallback(widget: TreeTableMobile) {
      if (!widget.props.rowSelectionType) {
        widget.props.rowSelectionType = selectionTypeEnums.SingleChoice;
      }
    },
  },
  {
    component: 'radio-editor',
    name: 'rowSelectionType',
    label: '',
    group: PropGroup.Table,
    hidden(widget) {
      return !widget.props.rowSelection || !widget.props.model;
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.' + selectionTypeEnums.SingleChoice,
          value: selectionTypeEnums.SingleChoice,
        },
        {
          label: 'sys.pageDesigner.' + selectionTypeEnums.MultipleChoice,
          value: selectionTypeEnums.MultipleChoice,
        },
      ],
    },
  },
  {
    component: 'field-formula-editor',
    name: 'root:children',
    label: '',
    group: PropGroup.FIELD,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      maxlength: 4,
      createField: (item, widget: TreeTableMobile) => {
        // const field = createWidgetByType(item.createType);
        // field.alias = item.label;
        // field.props.label = item.label;
        // field.i18n!.label = item.labeli18n;
        // field.props.remark = item.remark;
        // field.preLocation = widget.id;
        // field.props.model = widget.props.model;
        // field.props.isCustomField = true;
        // field.props.fieldType =
        //   item.createType === FormComponents.DataTableFormula ? item.type : 'text';
        // field.props.field =
        //   item.createType === FormComponents.DataTableFormula ? field.id : item.key;
        // if (item.createType === FormComponents.ReadonlyCmp) {
        //   field.name = 'sys.pageDesigner.custom';
        //   field.icon = 'icon-Custom';
        // } else {
        //   field.props.formula = item.formula;
        // }
        // return field;

        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        fieldWidget.props.isCustomField = true;
        fieldWidget.props.label = fieldWidget.alias;
        console.log('app-fieldWidget', fieldWidget);
        return fieldWidget;
      },
    },
  },
  {
    component: 'table-field-list-editor',
    name: 'root:children',
    label: '',
    group: PropGroup.FIELD,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      maxlength: 4,
      showcheckbox: false,
      createField: (item, widget: TreeTableMobile) => {
        try {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
          // if ([FormComponents.EXPRESSION, FormComponents.AGG].includes(fieldWidget.type)) {
          //   return fieldWidget;
          // }
          // const columnWidget = createWidgetByType(FormComponents.DataTableColumn);
          // const { icon, name } = fieldWidget;
          // const {
          //   field,
          //   fieldId,
          //   bindModelKey,
          //   fieldType,
          //   label,
          //   bindFieldKey,
          //   fieldCodeChain,
          //   fieldName,
          //   returnType,
          //   bindCompStyleType,
          //   selectType,
          // } = fieldWidget.props;
          // columnWidget.props.field = field!;
          // columnWidget.props.fieldId = fieldId!;
          // columnWidget.props.fieldType = fieldType;
          // columnWidget.props.label = label;
          // columnWidget.alias = fieldName;
          // columnWidget.props.modelKey = item.modelKey;
          // columnWidget.props.bindModelKey = bindModelKey;
          // columnWidget.props.bindFieldKey = bindFieldKey;
          // columnWidget.props.fieldCodeChain = fieldCodeChain;
          // columnWidget.props.fieldName = fieldName;
          // columnWidget.props.returnType = returnType;
          // columnWidget.props.bindCompStyleType = bindCompStyleType;
          // columnWidget.props.selectType = selectType;
          // columnWidget.icon = icon;
          // columnWidget.name = name;
          // columnWidget.preLocation = widget.id;
          // return columnWidget;
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  {
    component: 'default-expand-editor',
    name: 'defaultExpandLevel',
    label: 'sys.pageDesigner.defaultExpandLevel',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
  },
  {
    component: 'switch-editor',
    name: 'serialNumber',
    label: 'sys.pageDesigner.displayTableNumber',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
  },
  {
    component: 'data-filtering-new-editor',
    label: '',
    name: 'datafilter',
    group: PropGroup.LISTDATA,
    dependentProps: ['model'],
    _config: {
      modelKey: 'model',
      cascadeField: true,
    },
  },
  // {
  //   component: 'sorts-editor',
  //   label: '',
  //   name: 'collation',
  //   group: PropGroup.LISTDATA,
  //   dependentProps: ['model'],
  // },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'cellClickEvent',
    title: 'sys.pageDesigner.cellClickEvent',
    params: ['value'],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const beforeCreate = (widget: TreeTableMobile) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  // {
  //   component: 'table-height-editor',
  //   name: { number: 'tableheight', type: 'tableheightConfigure' },
  //   label: '',
  //   group: StyleGroup.SHOW_PROP,
  // },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];
