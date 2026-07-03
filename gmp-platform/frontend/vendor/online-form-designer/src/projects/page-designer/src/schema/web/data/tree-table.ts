import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  sortTypeEnum,
  tableColumnWidthEnum,
  TableEditingMethodEnum,
  ButtonType,
  operateSysEnums,
} from '/@page-designer/enum';
import { TreeTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { MaterialEnum, selectionTypeEnums } from '/@/enums/appEnum';
import { EntityModelTypeEnum, TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
// const options = () => {
//   return [
//     operateSysEnums.EDIT,
//     operateSysEnums.COLUMNDELETE,
//     operateSysEnums.DETAILS,
//     operateSysEnums.COLUMNLINK,
//     operateSysEnums.COPY,
//     operateSysEnums.USAGEINFORMATION,
//     operateSysEnums.MODELINGTRACEABILITY,
//     operateSysEnums.BATCHDELETE,
//     operateSysEnums.IMPORT,
//     operateSysEnums.EXPORT,
//     operateSysEnums.LABEL_PRINT,
//     operateSysEnums.DOCUMENT_PRINT,
//   ];
// };

const calcPosTag = (data: IData) => {
  const { pos } = data;
  if (pos === 0) {
    return 'row';
  }
  return pos === 1 ? 'header' : 'batch';
};

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<TreeTable, 'children'> = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.treeTable',
  alias: '',
  type: FormComponents.TreeTable,
  icon: 'icon-shuxingbiaoge',
  props: {
    model: '',
    refSearch: '',
    rowSelectionType: selectionTypeEnums.None,
    currentReload: false,
    customHeader: false,
    fullScreen: false,
    showOperate: false,
    headerSort: true,
    initializeLoad: true,
    datafilter: [],
    collation: [
      // {
      //   collationField: 'create_time_',
      //   collationSort: sortTypeEnum.DESC,
      // },
    ],
    rowdraggable: false,
    serialNumber: true,
    defaultExpandLevel: 2,
    editMethods: TableEditingMethodEnum.DEFAULTEDITING,
    visibleButtons: 1,
    levelHeaderGrouping: [],
    multiLevelHeader: false,
    cellHeightMode: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
    cellHeight: 10,
    cellHeaderHeightSync: false,
    ...displayProps,
  },
  style: {
    tableheight: 300,
    tableheightConfigure: tableColumnWidthEnum.ATUO,
    backgroundColor: '#FFFFFF',
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
    changeCallback(widget: TreeTable) {
      widget.props.levelHeaderGrouping = [];
      widget.props.multiLevelHeader = false;
      widget.props.refSearch = '';
      widget.children![1].children.splice(0);
    },
    _config: {
      type: 'TREE',
      category: 'entity',
    },
  },
  {
    component: 'select-editor',
    name: 'refSearch',
    label: 'sys.pageDesigner.refSearch',
    group: PropGroup.Table,
    dependentProps: ['model'],
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
    hidden(widget: TreeTable) {
      return widget.children[1].children.every((i) => i.props.readonly || i.props.fieldReadonly);
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

  // {
  //   component: 'switch-editor',
  //   name: 'rowSelection',
  //   label: 'sys.pageDesigner.multipleChoice',
  //   group: PropGroup.Table,
  //   hidden(widget) {
  //     return !widget.props.model;
  //   },
  // },
  {
    component: 'radio-bgc-editor',
    name: 'rowSelectionType',
    label: 'sys.pageDesigner.rowSelection',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.model;
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
    onMounted(widget: TreeTable) {
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
      createField: (item, widget: TreeTable) => {
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
        console.log('web-tree-fieldWidget', fieldWidget);
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
      excludeFieldKey: ['id_', 'full_path_', 'sort_num_'],
      createField: (item, widget: TreeTable) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        return fieldWidget;
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
        widget.parentComponent = FormComponents.DataTable;
      },
      modelKey: 'model',
      headerRightButton: (widget) => {
        return [
          FormComponents.CustomButton,
          FormComponents.ImportButton,
          FormComponents.ExportButton,
        ];
      },
      headerLeftButton: (widget) => {
        return [FormComponents.CustomButton, FormComponents.BatchDeleteButton];
      },
      columnsButton: (widget) => {
        const { modelType, supportProcess } = widget.props.modeldata || {};
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
        };
        return [
          FormComponents.CustomButton,
          FormComponents.SubTableEditBtn,
          FormComponents.SubTableDeleteBtn,
          FormComponents.SubTableCopyBtn,
          FormComponents.TableInfoButton,
          FormComponents.TableApproveButton,
          FormComponents.TableLinkButton,
          FormComponents.ModelingButton,
          FormComponents.LabelPrintButton,
          // FormComponents.DocumentPrintButton,
        ].filter((i) => {
          const fun = funMap[i];
          return fun ? fun() : true;
        });
      },
    },
    hidden(widget: any) {
      return !widget.props.model;
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
  // {
  //   component: 'sorts-editor',
  //   label: '',
  //   name: 'collation',
  //   group: PropGroup.LISTDATA,
  //   dependentProps: ['model'],
  // },
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
  //     isTree: true,
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
  //       header: 'root:children.2',
  //       row: 'root:children.0',
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
  //         desc: true,
  //         options,
  //         calcPosTag,
  //       },
  //       header: {
  //         title: 'sys.pageDesigner.headerButton',
  //         defaultMaxCount: 3,
  //         max: 5,
  //         desc: true,
  //         options,
  //         calcPosTag,
  //       },
  //       batch: {
  //         title: 'sys.pageDesigner.batchButton',
  //         defaultMaxCount: 3,
  //         max: 5,
  //         desc: true,
  //         options,
  //         calcPosTag,
  //       },
  //     },
  //   },
  // },
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
export const beforeCreate = (widget: TreeTable) => {
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
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];
