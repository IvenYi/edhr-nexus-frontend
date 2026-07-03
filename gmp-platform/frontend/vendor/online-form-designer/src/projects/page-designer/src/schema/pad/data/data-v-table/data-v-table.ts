import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  sortTypeEnum,
  ButtonType,
  DatasourceTypeEnum,
} from '/@page-designer/enum';
import { DataTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { selectionTypeEnums } from '@gct/runtime';

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<DataTable, 'children'> = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.dataTable',
  alias: '',
  type: FormComponents.DataVTable,
  icon: 'icon-a-Datatable',
  props: {
    model: undefined,
    // gridType: TableTypeEnum.DEFAULT,
    modeldata: {},
    subModelField: '',
    // searchType: TableSearchTypeEnum.NONE,
    // exp: '',
    refSearch: '',
    // pageSize: 20,
    rowSelectionType: selectionTypeEnums.None,
    selectTheEntireRow: false,
    currentReload: false,
    customHeader: false,
    fullScreen: false,
    headerSort: true,
    // showPagination: true,
    showOperate: false,
    initializeLoad: true,
    // productionScheduling: false,
    datafilter: [],
    collation: [],
    rowdraggable: false,
    stripe: false,
    // editMethods: TableEditingMethodEnum.DEFAULTEDITING,
    serialNumber: false,
    visibleButtons: 1,
    datasourceType: DatasourceTypeEnum.SERVICEDATASOURCE,
    customdataSource: false,
    datasourceConfig: null,
    doNotSubmit: false,
    autoResize: false,
    levelHeaderGrouping: [],
    multiLevelHeader: false,
    ...displayProps,
  },
  style: {
    maxHeight: 540,
    backgroundColor: '#FFFFFF',
    tableheight: 540,
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
    },
    _config: {
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
  //   name: 'showPagination',
  //   label: 'sys.pageDesigner.pagination',
  //   dependentProps: ['model'],
  //   group: PropGroup.SHOW,
  // },
  // {
  //   component: 'page-editor',
  //   name: 'pageSize',
  //   label: '',
  //   group: PropGroup.SHOW,
  //   dependentProps: ['model'],
  //   hidden(widget) {
  //     return !widget.props.model || !widget.props.showPagination;
  //   },
  // },
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
          return true;
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
      containFieldType: [
        FIELD_TYPE.TEXT,
        FIELD_TYPE.LONG_TEXT,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.BOOLEAN,
        FIELD_TYPE.DATE,
        FIELD_TYPE.TIME,
        FIELD_TYPE.DATE_TIME,
        FIELD_TYPE.SERIAL,
        FIELD_TYPE.USER,
        FIELD_TYPE.USER_MULTI,
        FIELD_TYPE.ORG,
        FIELD_TYPE.ORG_MULTI,
        FIELD_TYPE.ENUM_MULTI,
        FIELD_TYPE.ENUM,
        FIELD_TYPE.REF,
        FIELD_TYPE.REF_MULTI,
        FIELD_TYPE.TRANSACTION,
        FIELD_TYPE.RDO_REF,
        FIELD_TYPE.ATTACHMENT,
        FIELD_TYPE.IMAGE,
        FIELD_TYPE.EXPRESSION,
        FIELD_TYPE.AGG,
        FIELD_TYPE.LABEL_TEMPLATE_REF,
        FIELD_TYPE.PRINTER,
        FIELD_TYPE.SIGNATURE,
      ],
      createField: (item, widget: DataTable) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        // fieldWidget.props.fieldReadonly = true;
        return fieldWidget;
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
        //0 表示单行按钮
        if (widget.props.pos === 0) {
          widget.props.type = ButtonType.DEFAULT;
        }
      },
      modelKey: 'model',
      headerRightButton: (widget) => {
        return [FormComponents.CustomButton];
      },
      headerLeftButton: (widget) => {
        return [];
        return [FormComponents.CustomButton];
        // if (widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW) {
        //   return [FormComponents.CustomButton];
        // }
        // return [FormComponents.CustomButton, FormComponents.BatchDeleteButton];
      },
      columnsButton: (widget) => {
        const { modelType, modelCategory, supportProcess } = widget.props.modeldata || {};
        if (modelCategory === EntityModelCategoryEnum.VIEW) {
          return [
            FormComponents.CustomButton,
            // FormComponents.SubTableCopyBtn,
            FormComponents.TableInfoButton,
            FormComponents.TableLinkButton,
          ];
        }
        if (modelCategory === EntityModelCategoryEnum.DATA) {
          return [
            FormComponents.CustomButton,
            FormComponents.SubTableEditBtn,
            // FormComponents.SubTableDeleteBtn,
            // FormComponents.SubTableCopyBtn,
            FormComponents.TableInfoButton,
            FormComponents.TableLinkButton,
          ];
        }
        const funMap = {
          // [FormComponents.TableApproveButton]: () => {
          //   return (
          //     modelType &&
          //     [
          //       EntityModelTypeEnum.BASE,
          //       EntityModelTypeEnum.NDO,
          //       EntityModelTypeEnum.TREE,
          //       EntityModelTypeEnum.RDO,
          //     ].includes(modelType) &&
          //     !!supportProcess
          //   );
          // },
          // [FormComponents.UseinfoButton]: () => {
          //   const { appInfo } = useAppInfoStore();
          //   return appInfo.suiteKey === 'MEDPRO';
          // },
        };
        return [
          FormComponents.CustomButton,
          FormComponents.SubTableEditBtn,
          // FormComponents.SubTableDeleteBtn,
          // FormComponents.SubTableCopyBtn,
          FormComponents.TableInfoButton,
          FormComponents.TableLinkButton,
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
  // {
  //   component: 'table-height-editor',
  //   name: { number: 'tableheight', type: 'tableheightConfigure' },
  //   label: '',
  //   group: StyleGroup.SHOW_PROP,
  // },
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
