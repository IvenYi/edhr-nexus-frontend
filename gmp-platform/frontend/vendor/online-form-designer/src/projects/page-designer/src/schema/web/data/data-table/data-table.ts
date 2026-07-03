import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  sortTypeEnum,
  TableSearchTypeEnum,
  TableEditingMethodEnum,
  DatasourceTypeEnum,
} from '/@page-designer/enum';
import { DataTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { CreateType, FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import {
  TableTypeEnum,
  selectionTypeEnums,
  EntityModelTypeEnum,
  TABLE_CELL_HEIGHT_MODE,
} from '@gct/runtime';
import {
  getModelMetaListModelReferencedBy,
  getModelMetaListSlaveModel,
} from '/@/apis/gct-apaas/ModelMetaController';
import { useAppInfoStore } from '/@/store/modules/app-info';

const { t } = useI18n();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<DataTable, 'children'> = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.dataTable',
  alias: '',
  type: FormComponents.DataTable,
  icon: 'icon-a-Datatable',
  props: {
    model: undefined,
    gridType: TableTypeEnum.DEFAULT,
    modeldata: {},
    subModelField: '',
    searchType: TableSearchTypeEnum.NONE,
    exp: '',
    refSearch: '',
    pageSize: 20,
    rowSelectionType: selectionTypeEnums.None,
    selectTheEntireRow: false,
    currentReload: false,
    customHeader: false,
    fullScreen: false,
    headerSort: true,
    showPagination: true,
    showOperate: false,
    initializeLoad: true,
    productionScheduling: false,
    productionSchedulingSort: [],
    datafilter: [],
    collation: [],
    rowdraggable: false,
    stripe: false,
    editMethods: TableEditingMethodEnum.DEFAULTEDITING,
    serialNumber: true,
    visibleButtons: 1,
    datasourceType: DatasourceTypeEnum.SERVICEDATASOURCE,
    customdataSource: false,
    datasourceConfig: null,
    doNotSubmit: false,
    autoResize: false,
    levelHeaderGrouping: [],
    multiLevelHeader: false,
    cellHeightMode: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
    cellHeight: 10,
    cellHeaderHeightSync: false,
    ...displayProps,
  },
  style: {
    maxHeight: undefined,
    backgroundColor: '#FFFFFF',
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
    changeCallback(widget: DataTable) {
      widget.props.refSearch = '';
      widget.props.datafilter = [];
      widget.props.levelHeaderGrouping = [];
      widget.props.multiLevelHeader = false;
      widget.props.exp = '';
      widget.children![0].children.splice(0);
      widget.children![1].children.splice(0);
      widget.children![2].children.splice(0);
      widget.children![3].children.splice(0);
      widget.children[4].children.splice(0);
      widget.props.collation = [
        {
          collationField:
            widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
              ? undefined
              : 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ];
      widget.props.subModel = null;
      widget.props.subModelField = null;
      widget.props.subModelData = {};
      widget.props.gridType = TableTypeEnum.DEFAULT;
    },
    _config: {
      type: 'NDO,BASE,TREE,TRANSACTION,SIGN,CHECK_LIST,TXN_EXT',
      category: 'entity,data,view',
    },
  },
  {
    component: 'radio-editor',
    name: 'gridType',
    label: 'sys.pageDesigner.gridType',
    group: PropGroup.Table,
    dependentProps: ['model'],
    hidden(widget: DataTable) {
      return widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW;
    },
    changeCallback: (widget, val) => {
      widget.props.subModel = null;
      widget.props.subModelField = null;
      widget.props.subModelData = {};
      widget.children[4] = {};
      const data = widget.children[1] as any;
      if (data && data.children.length > 0 && val === TableTypeEnum.EMBED) {
        data.children.forEach((_) => {
          _.props.readonly = true;
        });
      }
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.gridDesign.' + TableTypeEnum.DEFAULT,
          value: TableTypeEnum.DEFAULT,
        },
        {
          label: 'sys.pageDesigner.gridDesign.' + TableTypeEnum.EMBED,
          value: TableTypeEnum.EMBED,
        },
      ],
    },
  },
  {
    component: 'select-editor',
    name: 'subModelField',
    label: 'sys.pageDesigner.gridDesign.subModel',
    group: PropGroup.Table,
    dependentProps: ['model'],
    hidden(widget: DataTable) {
      return widget.props.gridType !== TableTypeEnum.EMBED;
    },
    _config: {
      options: async (widget) => {
        const data = await getModelMetaListModelReferencedBy({
          modelKey: widget.props.model,
          type: FIELD_TYPE.REF,
        });
        const arr: any[] = [];
        if (data) {
          data.forEach((item) => {
            const items = item.fieldMetaList!;
            return items
              .filter((_) => {
                return _.bindInfo === widget.props.model;
              })
              .forEach((_) => {
                arr.push({
                  label: `${item.name}(${_.name})`,
                  value: `${item.key}:${_.key}`,
                  data: item,
                  field: _,
                  suffix: 'sys.pageDesigner.refdataTable',
                });
              });
          });
        }
        const data2 = await getModelMetaListSlaveModel({
          modelKey: widget.props.model,
        });
        if (data2) {
          data2.forEach((item) => {
            item.fieldMetaList!.forEach((_) => {
              arr.push({
                label: `${item.name}(${_.name})`,
                value: `${_.key}:ref_master_id_`,
                data: item,
                field: _,
                suffix: 'sys.pageDesigner.subTable',
              });
            });
          });
        }
        return arr;
      },
      selectChange(widget, val, item) {
        if (val) {
          const data = createWidgetByType(FormComponents.SubDataTable);
          data.props.model = item.data.key;
          data.children[4].children[0].children[0].props.model = item.data.key;
          data.props.modeldata = {
            modelType: item.data.type,
            modelCategory: item.data.modelCategory || EntityModelCategoryEnum.ENTITY,
          };
          data.props.subModelField = widget.props.subModelField;
          data.preLocation = widget.id;
          data.props.parentModel = widget.props.model;
          widget.children[4] = data;
        } else {
          widget.children[4] = {};
        }
      },
    },
  },
  {
    component: 'radio-bgc-editor',
    name: 'searchType',
    label: 'sys.pageDesigner.tableSearch',
    group: PropGroup.Table,
    dependentProps: ['model'],
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.none',
          value: TableSearchTypeEnum.NONE,
        },
        {
          label: 'sys.pageDesigner.embeddedSearch',
          value: TableSearchTypeEnum.EMBEDDED,
        },
        {
          label: 'sys.pageDesigner.externalSearch',
          value: TableSearchTypeEnum.EXTERNAL,
        },
      ],
    },
  },
  {
    component: 'search-rule-editor',
    name: 'exp',
    label: '',
    group: PropGroup.Table,
    hidden(widget: DataTable) {
      return widget.props.searchType !== TableSearchTypeEnum.EMBEDDED;
    },
    _config: {
      getSearchWidgets(widget: DataTable) {
        const list = [];
        widget.children[1].children.forEach((i) => {
          const w = i.children?.[0];
          if (w) {
            w.props.label = i.props.label || i.alias;
            list.push(w);
          }
        });
        return list;
      },
    },
  },
  {
    component: 'select-editor',
    name: 'refSearch',
    label: 'sys.pageDesigner.refSearch',
    group: PropGroup.Table,
    dependentProps: ['model'],
    hidden(widget: DataTable) {
      return widget.props.searchType !== TableSearchTypeEnum.EXTERNAL;
    },
    _config: {
      options: () => {
        const { getWidgetByScope } = useDesigner();
        return getWidgetByScope(FormComponents.Search).map((i) => {
          return { label: `${t(i.name)} ${i.id}`, value: i.id };
        });
      },
    },
  },
  {
    component: 'radio-editor',
    name: 'editMethods',
    label: 'sys.pageDesigner.editMethods',
    group: PropGroup.Table,
    dependentProps: ['model'],
    hidden(widget: DataTable) {
      return (
        widget.children[1].children.every((i) => i.props.readonly || i.props.fieldReadonly) ||
        widget.props.gridType === TableTypeEnum.EMBED
      );
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.' + TableEditingMethodEnum.DEFAULTEDITING,
          value: TableEditingMethodEnum.DEFAULTEDITING,
        },
        {
          label: 'sys.pageDesigner.' + TableEditingMethodEnum.CLICKTOENTEREDITING,
          value: TableEditingMethodEnum.CLICKTOENTEREDITING,
        },
      ],
    },
  },
  {
    component: 'switch-editor',
    name: 'showPagination',
    label: 'sys.pageDesigner.pagination',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
  },
  {
    component: 'page-editor',
    name: 'pageSize',
    label: '',
    group: PropGroup.SHOW,
    dependentProps: ['model'],
    hidden(widget) {
      return !widget.props.model || !widget.props.showPagination;
    },
  },
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
      formItemCheckbox: {
        label: 'sys.pageDesigner.selectTheEntireRow',
        propsKey: 'selectTheEntireRow',
        hidden(widget) {
          return widget.props.rowSelectionType === selectionTypeEnums.None;
        },
      },
    },
    onMounted(widget: DataTable) {
      if (widget.props.rowSelection) {
        widget.props.rowSelectionType = selectionTypeEnums.MultipleChoice;
      } else if (!widget.props.rowSelectionType || widget.props.rowSelectionType == 'radio') {
        widget.props.rowSelectionType = selectionTypeEnums.None;
      }
      widget.props.rowSelection = false;
    },
  },
  // {
  //   component: 'switch-editor',
  //   name: 'rowSelection',
  //   label: 'sys.pageDesigner.multipleChoice',
  //   dependentProps: ['model'],
  //   group: PropGroup.SHOW,
  //   hidden(widget) {
  //     return (
  //       !widget.props.model ||
  //       widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
  //     );
  //   },
  // },
  {
    component: 'switch-editor',
    name: 'initializeLoad',
    label: 'sys.pageDesigner.initializeLoad',
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
    component: 'radio-editor',
    name: 'doNotSubmit',
    label: 'sys.pageDesigner.submitRuleProp',
    group: PropGroup.Table,
    hidden(widget) {
      // const items = widget.children;
      // if (items && items.length > 0) {
      //   const fields = items[1].children as IData[];
      //   if (fields && fields.length > 0) {
      //     const i = fields.findIndex((field) => {
      //       return !(field.props.fieldReadonly == true || field.props.readonly == true);
      //     });
      //     if (i === -1) {
      //       return true;
      //     }
      //   }
      // }
      return (
        !widget.props.model ||
        widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
      );
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.doSubmit',
          value: false,
        },
        {
          label: 'sys.pageDesigner.doNotSubmit',
          value: true,
        },
      ],
    },
  },
  {
    component: 'switch-editor',
    name: 'multiLevelHeader',
    label: 'sys.pageDesigner.multiLevelHeader',
    group: PropGroup.FIELD,
    dependentProps: ['model'],
  },
  {
    component: 'field-level-editor',
    name: 'levelHeaderGrouping',
    label: '',
    group: PropGroup.FIELD,
    hidden: (widget) => !widget.props.multiLevelHeader,
    saveHook: (widget) => {
      if (!widget.props.multiLevelHeader) {
        widget.props.levelHeaderGrouping = [];
      }
    },
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
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        fieldWidget.props.isCustomField = true;
        fieldWidget.props.label = fieldWidget.alias;
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
      showcheckbox: true,
      supportSameField: true,
      createField: (item, widget: DataTable) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        return fieldWidget;
      },
    },
  },

  {
    component: 'switch-editor',
    name: 'fullScreen',
    label: 'sys.pageDesigner.fullScreen',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
    },
  },

  {
    component: 'switch-editor',
    name: 'autoResize',
    label: 'sys.pageDesigner.selfAdaption',
    group: PropGroup.SHOW,
    kit: ['eDHR'],
    hidden(widget) {
      return !widget.props.model;
    },
  },
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
  // 排产试算
  {
    component: 'switch-editor',
    name: 'productionScheduling',
    label: 'sys.pageDesigner.productionScheduling',
    group: PropGroup.SHOW,
    kit: ['MEDPRO'],
    hidden(widget) {
      return !widget.props.model || widget.props.doNotSubmit !== true;
    },
  },
  // 排产试算排序
  {
    component: 'sorts-editor',
    name: 'productionSchedulingSort',
    label: '',
    group: PropGroup.SHOW,
    kit: ['MEDPRO'],
    hidden(widget) {
      return (
        !widget.props.model ||
        widget.props.productionScheduling !== true ||
        widget.props.doNotSubmit !== true
      );
    },
    _config: {
      notCollationField: true,
      standardSorting: false,
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
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
              'editor': '{editor|number|cellHeight}',
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
    component: 'gct-table-button-group-editor',
    label: '',
    dependentProps: ['model'],
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
        widget.parentComponent = FormComponents.DataTable;
      },
      modelKey: 'model',
      headerRightButton: (widget) => {
        const { modelCategory, modelType } = widget.props.modeldata || {};
        if (modelCategory === EntityModelCategoryEnum.VIEW) {
          return [FormComponents.CustomButton, FormComponents.ExportButton];
        }
        if (
          modelCategory === EntityModelCategoryEnum.DATA ||
          modelType === EntityModelTypeEnum.TRANSACTION ||
          modelType === EntityModelTypeEnum.WORKFLOW
        ) {
          return [FormComponents.CustomButton];
        }
        const { appInfo } = useAppInfoStore();
        const suiteKey = appInfo.suiteKey;
        if (suiteKey === 'eDHR') {
          return [
            FormComponents.DropdownButton,
            FormComponents.CustomButton,
            FormComponents.ImportButton,
            FormComponents.ExportButton,
          ];
        }
        return [
          FormComponents.CustomButton,
          FormComponents.ImportButton,
          FormComponents.ExportButton,
        ];
      },
      headerLeftButton: (widget) => {
        if (widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW) {
          return [FormComponents.CustomButton];
        }
        return [FormComponents.CustomButton, FormComponents.BatchDeleteButton];
      },
      columnsButton: (widget) => {
        const { modelType, modelCategory, supportProcess } = widget.props.modeldata || {};
        const { appInfo } = useAppInfoStore();
        const btnList: any[] = [];
        if (appInfo.suiteKey === 'eDHR') {
          btnList.push(FormComponents.DropdownButton);
        }
        if (modelCategory === EntityModelCategoryEnum.VIEW) {
          return btnList.concat([
            FormComponents.CustomButton,
            FormComponents.SubTableCopyBtn,
            FormComponents.TableInfoButton,
            FormComponents.TableLinkButton,
          ]);
        }
        if (modelCategory === EntityModelCategoryEnum.DATA) {
          return btnList.concat([
            FormComponents.CustomButton,
            FormComponents.SubTableEditBtn,
            FormComponents.SubTableDeleteBtn,
            FormComponents.SubTableCopyBtn,
            FormComponents.TableInfoButton,
            FormComponents.TableLinkButton,
          ]);
        }
        const funMap = {
          [FormComponents.TableApproveButton]: () => {
            return (
              modelType &&
              [
                EntityModelTypeEnum.BASE,
                EntityModelTypeEnum.NDO,
                EntityModelTypeEnum.TREE,
                EntityModelTypeEnum.RDO,
              ].includes(modelType) &&
              !!supportProcess
            );
          },
          [FormComponents.UseinfoButton]: () => {
            const { appInfo } = useAppInfoStore();
            return appInfo.suiteKey === 'MEDPRO';
          },
          [FormComponents.DropdownButton]: () => {
            const { appInfo } = useAppInfoStore();
            return appInfo.suiteKey === 'eDHR';
          },
        };
        return [
          FormComponents.CustomButton,
          FormComponents.SubTableEditBtn,
          FormComponents.SubTableDeleteBtn,
          FormComponents.SubTableCopyBtn,
          FormComponents.TableInfoButton,
          FormComponents.TableApproveButton,
          FormComponents.UseinfoButton,
          FormComponents.TableLinkButton,
          FormComponents.ModelingButton,
          FormComponents.LabelPrintButton,
          FormComponents.DropdownButton,
          // FormComponents.DocumentPrintButton,
        ].filter((i) => {
          const fun = funMap[i];
          return fun ? fun() : true;
        });
      },
    },
  },
  {
    component: 'switch-editor',
    name: 'customdataSource',
    label: 'sys.pageDesigner.customDataSource',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return !widget.props.model;
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
export const beforeCreate = (widget: DataTable) => {
  const ope = createWidgetByType(FormComponents.DataTableOpe);
  ope.preLocation = widget.id;
  // ope.id = undefined;
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
    {
      alias: '嵌套表格',
      children: [],
    },
  ];
};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'table-height-editor',
    name: { number: 'tableheight', type: 'tableheightConfigure' },
    label: '',
    group: StyleGroup.SHOW_PROP,
  },
  // {
  //   component: 'number-editor',
  //   label: 'sys.pageDesigner.maximumHeight',
  //   group: StyleGroup.LAYOUT,
  //   name: 'maxHeight',
  //   _config: {
  //     min: 200,
  //   },
  // },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];
