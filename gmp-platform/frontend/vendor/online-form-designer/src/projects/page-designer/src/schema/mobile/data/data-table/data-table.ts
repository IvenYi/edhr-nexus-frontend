import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  sortTypeEnum,
  DisplayType,
} from '/@page-designer/enum';
import { DataTableMobile } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayProps, displayEditor } from '../../../common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { selectionTypeEnums, MaterialEnum } from '/@/enums/appEnum';

const { t } = useI18n();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: DataTableMobile = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.dataTable',
  alias: '',
  type: FormComponents.DataTable,
  icon: 'icon-a-Datatable',
  children: [],
  props: {
    refSearch: '',
    model: undefined,
    pageSize: 20,
    initializeLoad: true,
    datafilter: [],
    collation: [],
    rowdraggable: false,
    stripe: false,
    serialNumber: false,
    customdataSource: false,
    datasourceConfig: null,
    rowSelection: false,
    rowSelectionType: selectionTypeEnums.SingleChoice,
    ...displayProps,
  },
  style: { maxHeight: '300' },
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
    changeCallback(widget: DataTableMobile) {
      widget.props.refSearch = '';
      widget.children.splice(0);
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
    _config: {
      type: 'NDO,BASE,TREE,TRANSACTION,SIGN,CHECK_LIST,TXN_EXT',
      category: 'entity,data,view',
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
  // {
  //   component: 'switch-editor',
  //   name: 'rowdraggable',
  //   label: 'sys.pageDesigner.rowdraggable',
  //   group: PropGroup.Table,
  //   hidden(widget) {
  //     return !widget.props.model;
  //   },
  // },
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
      createField: (item, widget: DataTableMobile) => {
        // const field = createWidgetByType(item.createType);
        // field.alias = item.name || item.label;
        // field.props.label = item.name || item.label;
        // field.i18n!.label = item.i18nConfig || item.labeli18n;
        // field.props.remark = item.description || item.remark;
        // field.preLocation = widget.id;
        // field.props.model = widget.props.model;
        // field.props.isCustomField = true;
        // field.props.fieldType = item.type || 'text';
        // field.props.field = item.key || field.id;
        // if (item.createType === FormComponents.ReadonlyCmp) {
        //   field.name = 'sys.pageDesigner.custom';
        //   field.icon = 'icon-zidingyixianshiziduan';
        // } else {
        //   field.props.formula = item.specificConfig?.formulaConfig?.exp || item.formula;
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
      createField: (item, widget: DataTableMobile) => {
        try {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
        } catch (error) {
          console.log(error);
        }
      },
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
      cascadeField: true,
    },
  },
  {
    component: 'sorts-editor',
    label: '',
    name: 'collation',
    group: PropGroup.LISTDATA,
    dependentProps: ['model'],
  },
  {
    component: 'switch-editor',
    name: 'rowSelection',
    label: 'sys.pageDesigner.rowSelection',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
    changeCallback(widget: DataTableMobile) {
      if (!widget.props.rowSelectionType) {
        widget.props.rowSelectionType = selectionTypeEnums.SingleChoice;
      }
    },
  },
  {
    component: 'radio-editor',
    name: 'rowSelectionType',
    label: '',
    group: PropGroup.SHOW,
    dependentProps: ['model'],
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
    component: 'switch-editor',
    name: 'initializeLoad',
    label: 'sys.pageDesigner.initializeLoad',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
  },
  {
    component: 'switch-editor',
    name: 'customdataSource',
    label: 'sys.pageDesigner.customDataSource',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return (
        !widget.props.model || widget.props.modeldata?.modelCategory == EntityModelCategoryEnum.VIEW
      );
    },
  },
  {
    component: 'data-sourse-editor',
    name: 'datasourceConfig',
    label: '',
    dependentProps: ['model'],
    group: PropGroup.DATASOURCE,
    hidden(widget: DataTableMobile) {
      return !widget.props.customdataSource;
    },
  },

  {
    component: 'switch-editor',
    name: 'serialNumber',
    label: 'sys.pageDesigner.displayTableNumber',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'radioEvent',
    title: 'sys.pageDesigner.radioEvent',
    params: ['value'],
  },
  {
    name: 'checkboxEvent',
    title: 'sys.pageDesigner.checkboxEvent',
    params: ['checked'],
  },
  {
    name: 'cellClickEvent',
    title: 'sys.pageDesigner.cellClickEvent',
    params: ['value'],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const beforeCreate = (widget: DataTableMobile) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'number-editor',
    label: 'sys.pageDesigner.maximumHeight',
    group: StyleGroup.LAYOUT,
    name: 'maxHeight',
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];
