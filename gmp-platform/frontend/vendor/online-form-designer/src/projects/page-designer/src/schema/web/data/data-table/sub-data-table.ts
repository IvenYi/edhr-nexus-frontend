import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  TableSearchTypeEnum,
  TableEditingMethodEnum,
  DatasourceTypeEnum,
  operateSysEnums,
  sortTypeEnum,
  tableColumnWidthEnum,
  BuiltinType,
} from '/@page-designer/enum';
import { DataTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayProps } from '../../../common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { MaterialEnum } from '/@/enums/appEnum';
import {
  EntityModelCategoryEnum,
  TABLE_CELL_HEIGHT_MODE,
  TableTypeEnum,
  selectionTypeEnums,
} from '@gct/runtime';
import { useAppInfoStore } from '/@/store/modules/app-info';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<DataTable, 'children'> = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.subDataTable',
  alias: '',
  type: FormComponents.SubDataTable,
  icon: 'icon-a-Datatable',
  props: {
    model: undefined,
    gridType: TableTypeEnum.SUB,
    modeldata: {},
    searchType: TableSearchTypeEnum.NONE,
    exp: '',
    refSearch: '',
    pageSize: 10000,
    currentReload: false,
    customHeader: false,
    fullScreen: false,
    headerSort: true,
    showPagination: false,
    showOperate: false,
    initializeLoad: false,
    productionScheduling: false,
    productionSchedulingSort: [],
    datafilter: [],
    collation: [],
    rowdraggable: false,
    stripe: false,
    editMethods: TableEditingMethodEnum.DEFAULTEDITING,
    serialNumber: false,
    visibleButtons: 1,
    datasourceType: DatasourceTypeEnum.SERVICEDATASOURCE,
    customdataSource: false,
    datasourceConfig: null,
    doNotSubmit: false,
    isFieldAsync: true,
    rowSelectionType: selectionTypeEnums.None,
    cellHeightMode: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
    cellHeight: 10,
    cellHeaderHeightSync: false,
    ...displayProps,
  },
  style: { maxHeight: 500 },
  events: {},
  formItem: false,
  hideMask: true,
};

const options = () => {
  return [
    operateSysEnums.EDIT,
    operateSysEnums.COLUMNDELETE,
    operateSysEnums.DETAILS,
    operateSysEnums.COLUMNLINK,
    operateSysEnums.COPY,
    operateSysEnums.USAGEINFORMATION,
    operateSysEnums.MODELINGTRACEABILITY,
    operateSysEnums.BATCHDELETE,
    operateSysEnums.IMPORT,
    operateSysEnums.EXPORT,
  ];
};

const calcPosTag = (data: IData) => {
  const { pos } = data;
  if (pos === 0) {
    return 'row';
  }
  return pos === 1 ? 'header' : 'batch';
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'radio-bgc-editor',
    name: 'rowSelectionType',
    label: 'sys.pageDesigner.rowSelection',
    group: PropGroup.SHOW,
    hidden(widget) {
      return (
        !widget.props.model ||
        widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
      );
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.' + selectionTypeEnums.None,
          value: selectionTypeEnums.None,
        },
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
    onMounted(widget: DataTable) {
      if (widget.props.rowSelection) {
        widget.props.rowSelectionType = selectionTypeEnums.MultipleChoice;
      } else if (!widget.props.rowSelectionType) {
        widget.props.rowSelectionType = selectionTypeEnums.None;
      }
    },
  },
  // {
  //   component: 'switch-editor',
  //   name: 'rowSelection',
  //   label: 'sys.pageDesigner.multipleChoice',
  //   dependentProps: ['model'],
  //   group: PropGroup.SHOW,
  // },
  {
    component: 'switch-editor',
    name: 'serialNumber',
    label: 'sys.pageDesigner.displayTableNumber',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
  },
  {
    component: 'field-formula-editor',
    name: 'root:children.1.children',
    label: '',
    group: PropGroup.FIELD,
    hidden(widget) {
      return !widget.props.model;
    },
    formItemStyle: { marginBottom: '12px' },
    _config: {
      createField: (item, widget: DataTable) => {
        // const field = createWidgetByType(item.createType);
        // field.alias = item.label;
        // field.props.label = item.label;
        // field.i18n!.label = item.labeli18n;
        // field.props.remark = item.remark;
        // field.props.model = widget.props.model;
        // field.preLocation = widget.id;
        // field.props.fieldType =
        //   item.createType === FormComponents.DataTableFormula ? item.type : 'text';
        // field.props.field =
        //   item.createType === FormComponents.DataTableFormula ? field.id : item.key;
        // field.props.isCustomField = true;
        // if (item.createType === FormComponents.ReadonlyCmp) {
        //   field.name = 'sys.pageDesigner.custom';
        //   field.icon = 'icon-zidingyixianshiziduan';
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
        console.log('web-sub-fieldWidget', fieldWidget);
        return fieldWidget;
      },
    },
  },
  {
    component: 'table-field-list-editor',
    name: 'root:children.1.children',
    label: '',
    group: PropGroup.FIELD,
    hidden(widget) {
      return !widget.props.model;
    },
    formItemStyle: { marginBottom: '12px' },
    _config: {
      showcheckbox: false,
      createField: (item, widget: DataTable) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialEmbedTableField,
          preLocation: widget.id,
        });
        fieldWidget.props.fieldReadonly = true;
        fieldWidget.props.readonly = true;
        fieldWidget.style.columnwidth = 100;
        fieldWidget.style.columnwidthConfigure = tableColumnWidthEnum.ATUO;
        return fieldWidget;
      },
    },
    changeCallback(widget, value) {
      if (widget.props.isFieldAsync) {
        const children = value.map((i) => {
          return {
            ...i,
            materialType: MaterialEnum.MaterialSubTableModalField,
            props: { ...i.props, readonly: false },
          };
        });
        widget.children[4].children[0].children[0].children = [...children];
      }
    },
  },
  // {
  //   component: 'sub-modal-editor',
  //   name: 'root:children.4',
  //   label: 'sys.pageDesigner.widgetType',
  //   group: PropGroup.Table,
  //   hidden(widget) {
  //     return !widget.props.model;
  //   },
  // },
  {
    component: 'switch-editor',
    name: 'currentReload',
    label: 'sys.pageDesigner.currentReload',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'switch-editor',
    name: 'customHeader',
    label: 'sys.pageDesigner.customHeader',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'switch-editor',
    name: 'headerSort',
    label: 'sys.pageDesigner.headerSort',
    group: PropGroup.SHOW,
    onMounted(widget) {
      if (widget.props.headerSort == null) {
        widget.props.headerSort = true;
      }
    },
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'panel-divider-editor',
    name: 'divider',
    group: PropGroup.SHOW,
    label: '',
    hidden(widget) {
      return !widget.props.model;
    },
  },
  {
    component: 'gct-table-cell-height-editor',
    name: { cellHeightMode: 'cellHeightMode', cellHeight: 'cellHeight' },
    label: 'sys.pageDesigner.cellHeightMode',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      defaultValue: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
      options: [
        {
          label: 'sys.pageDesigner.tableCellHeaderMode.one',
          value: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
        },
        {
          label: 'sys.pageDesigner.tableCellHeaderMode.all',
          value: TABLE_CELL_HEIGHT_MODE.ALL_ROW,
        },
        {
          label: 'sys.pageDesigner.tableCellHeaderMode.custom',
          value: TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW,
          _config: {
            i18nData: {
              editor: '{editor|number|cellHeight}',
            },
            number: {
              min: 1,
              max: 10,
              decimalSeparator: 0,
              defaultValue: 10,
            },
          },
        },
      ],
    },
  },
  {
    component: 'checker-editor',
    name: 'cellHeaderHeightSync',
    label: '',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      label: 'sys.pageDesigner.cellHeaderHeightSync',
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
  {
    component: 'gct-table-button-group-editor',
    label: '',
    name: {
      headerRight: {
        value: 'root:children.2.children',
        visibleButtons: 'root:children.2.visibleButtons',
      },
      headerLeft: {
        value: 'root:children.3.children',
        visibleButtons: 'root:children.3.visibleButtons',
      },
      columns: {
        value: 'root:children.0.children',
        visibleButtons: 'root:children.0.props.visibleButtons',
      },
    },
    group: PropGroup.LISTBUTTON,
    _config: {
      /**添加按钮的回调 */
      eventCallback(widget: any) {
        widget.parentComponent = FormComponents.SubDataTable;
      },
      modelKey: 'model',
      headerRightButton: (widget) => {
        return [
          FormComponents.CustomButton,
          FormComponents.SubTableAddBtn,
          FormComponents.ImportButton,
          FormComponents.ExportButton,
        ];
      },
      headerLeftButton: (widget) => {
        return [FormComponents.CustomButton, FormComponents.BatchDeleteButton];
      },
      columnsButton: (widget) => {
        return [
          FormComponents.CustomButton,
          FormComponents.SubTableEditBtn,
          FormComponents.SubTableDeleteBtn,
          FormComponents.SubTableCopyBtn,
          FormComponents.TableInfoButton,
          FormComponents.TableLinkButton,
          FormComponents.ModelingButton,
        ];
      },
    },
  },
  {
    component: 'switch-editor',
    name: 'customdataSource',
    label: 'sys.pageDesigner.customDataSource',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      const { appInfo } = useAppInfoStore();
      return appInfo.suiteKey !== 'MEDPRO' && !widget.props.model;
    },
  },
  {
    component: 'data-sourse-editor',
    name: 'datasourceConfig',
    label: '',
    dependentProps: ['model'],
    group: PropGroup.DATASOURCE,
    hidden(widget: DataTable) {
      return !widget.props.customdataSource;
    },
  },
  // {
  //   component: 'gct-table-add-button-editor',
  //   label: '',
  //   name: {
  //     list: {
  //       row: 'root:children.0',
  //       header: 'root:children.2',
  //       batch: 'root:children.3',
  //     },
  //     cmpId: 'root:id',
  //     model: 'model',
  //   },
  //   group: PropGroup.LISTBUTTON,
  //   dependentProps: ['model'],
  //   _config: {
  //     calcPosTag,
  //     options,
  //     module: PageTypeEnum.WEB,
  //     createField: () => {
  //       const widget = createWidgetByType(FormComponents.CustomButton as any);
  //       widget.props.title = '按钮';
  //       return widget;
  //     },
  //     defaultButtonType: {
  //       hasIcon: false,
  //       hasText: true,
  //       type: ButtonType.LINK,
  //       versionMode: 0,
  //       pos: 1,
  //     },
  //   },
  // },
  // {
  //   component: 'gct-table-button-config-editor',
  //   label: '',
  //   name: {
  //     list: {
  //       row: 'root:children.0',
  //       header: 'root:children.2',
  //       batch: 'root:children.3',
  //     },
  //     cmpId: 'root:id',
  //     model: 'model',
  //   },
  //   group: PropGroup.LISTBUTTON,
  //   dependentProps: ['model'],
  //   _config: {
  //     calcPosTag,
  //     btnConfig: {
  //       row: {
  //         title: 'sys.pageDesigner.singleLineButton',
  //         defaultMaxCount: 3,
  //         max: 5,
  //         options,
  //         calcPosTag,
  //       },
  //       header: {
  //         title: 'sys.pageDesigner.headerButton',
  //         defaultMaxCount: 3,
  //         max: 5,
  //         options,
  //         calcPosTag,
  //       },
  //       batch: {
  //         title: 'sys.pageDesigner.batchButton',
  //         defaultMaxCount: 3,
  //         max: 5,
  //         options,
  //         calcPosTag,
  //       },
  //     },
  //   },
  // },
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
export const beforeCreate = (widget: DataTable) => {
  const { bindSubTableFormId, modalSchema } = _initModalInfo(widget);
  widget.props.bindSubTableFormId = bindSubTableFormId;
  const ope = createWidgetByType(FormComponents.DataTableOpe);
  ope.preLocation = widget.id;
  widget.children = [
    ope,
    {
      alias: '字段组',
      children: [],
    },
    {
      alias: '头部按钮',
      preLocation: widget.id,
      visibleButtons: 5,
      children: [],
    },
    {
      alias: '批量按钮',
      preLocation: widget.id,
      visibleButtons: 5,
      children: [],
    },
    modalSchema,
  ];
  widget.props.collation = [
    {
      collationField:
        widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
          ? undefined
          : 'create_time_',
      collationSort: sortTypeEnum.DESC,
    },
  ];
};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'number-editor',
    label: 'sys.pageDesigner.maximumHeight',
    group: StyleGroup.LAYOUT,
    name: 'maxHeight',
    _config: {
      min: 200,
    },
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];

const _initModalInfo = (tableWidget) => {
  const modalSchema = createWidgetByType(BuiltinType.MODAL);
  modalSchema.props.isSubTableModal = true;
  modalSchema.props.bindSubTableId = tableWidget.id;
  const form = createWidgetByType(FormComponents.Form);
  form.preLocation = tableWidget.id;
  modalSchema.children[0].children.push(form);
  return {
    modalSchema,
    bindSubTableFormId: form.id,
  };
};
