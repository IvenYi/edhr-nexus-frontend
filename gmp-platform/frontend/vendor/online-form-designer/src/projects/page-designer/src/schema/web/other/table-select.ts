import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  sortTypeEnum,
  BindCmpStyleTypeEnum,
  RowSelectionTypeEnums,
} from '/@page-designer/enum';
import { TableSelect } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { createWidgetByType, beginDrag } from '/@page-designer/schema/utils';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import columnEditorConfig from '../../common-config/column-editor-config';
import { aggBasicPropEditorList } from '../../field/form/agg';
import { expressionBasicPropEditorList } from '../../field/form/expression';
import { getModelMetaListMasterModel } from '/@/apis/gct-apaas/ModelMetaController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { CARD_TRIGGER_ENUM, TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<TableSelect, 'platform' | 'children'> = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.tableSelect',
  alias: '',
  type: FormComponents.TableSelect,
  icon: 'icon-liebiaoxuanzeqi',
  //index: 0 搜索 1 字段列
  // children: [],
  props: {
    showPagination: false,
    pageSize: 20,
    search: false,
    index: false,
    rowSelectionType: RowSelectionTypeEnums.SingleChoice,
    model: undefined,
    datafilter: [],
    collation: [],
    initLoad: true,
    parentModelSelection: false,
    refParentModelkey: '',
    customdataSource: false,
    datasourceConfig: null,
    selectTheEntireRow: false,
    cellHeightMode: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
    cellHeight: 10,
    cellHeaderHeightSync: false,
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
  i18n: {},
  ignoringStyle: ['height'],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.TABLESELECT_CONFIG,
    required: true,
    changeCallback: (widget: TableSelect) => {
      widget.props.parentModelSelection = false;
      widget.props.refParentModelkey = '';
      widget.children[0]!.props.model = widget.props.model;
      widget.children[0]!.props.modeldata = widget.props.modeldata;
      widget.children[0]!.props.exp = '';
      widget.children[0].children = [];
      widget.children[1].children = [];
      widget.props.datafilter = [];
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
      category: 'entity,data,view',
    },
  },
  {
    component: 'radio-editor',
    name: 'rowSelectionType',
    label: 'sys.pageDesigner.rowSelectionType',
    group: PropGroup.TABLESELECT_CONFIG,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.rowSelectType.' + RowSelectionTypeEnums.SingleChoice,
          value: RowSelectionTypeEnums.SingleChoice,
        },
        {
          label: 'sys.pageDesigner.rowSelectType.' + RowSelectionTypeEnums.MultipleChoice,
          value: RowSelectionTypeEnums.MultipleChoice,
        },
      ],
      formItemCheckbox: {
        label: 'sys.pageDesigner.selectTheEntireRow',
        propsKey: 'selectTheEntireRow',
      },
    },
  },
  {
    component: 'switch-editor',
    name: 'search',
    label: 'sys.pageDesigner.search',
    dependentProps: ['model'],
    group: PropGroup.TABLESELECT_CONFIG,
  },
  {
    component: 'switch-editor',
    name: 'parentModelSelection',
    label: 'sys.pageDesigner.parentModelFieldSelection',
    dependentProps: ['model'],
    group: PropGroup.TABLESELECT_CONFIG,
    changeCallback(widget: TableSelect, value: boolean) {
      if (!value) {
        widget.props.refParentModelkey = '';
        const children = widget.children[1].children;
        /**过滤调主表上的字段 */
        widget.children[1].children = children.filter(
          (i) => i.props.bindFieldKey !== 'ref_master_id_',
        );
      }
    },
    hidden(widget: TableSelect) {
      return widget.props.modeldata?.subModel !== 1;
    },
  },
  {
    component: 'select-editor',
    name: 'refParentModelkey',
    label: 'sys.pageDesigner.refParentModelkey',

    group: PropGroup.TABLESELECT_CONFIG,
    hidden: (widget: TableSelect) => !widget.props.parentModelSelection,
    _config: {
      clearable: false,
      options: async (widget: TableSelect) => {
        const models = await getModelMetaListMasterModel({
          subModelKey: widget.props.model,
        });
        if (models?.length === 1) {
          widget.props.refParentModelkey = models[0].key || '';
        }
        return models?.map((i) => {
          return { value: i.key, label: i.name };
        });
      },
    },
    changeCallback(widget: TableSelect) {
      const children = widget.children[1].children;
      /**过滤调主表上的字段 */
      widget.children[1].children = children.filter(
        (i) => i.props.bindFieldKey !== 'ref_master_id_',
      );
    },
  },
  {
    component: 'table-field-list-editor',
    name: 'root:children.1.children',
    label: '',
    group: PropGroup.FIELD,
    formItemStyle: { marginBottom: '12px' },
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      draggable: true,
      excludeFieldKey: ['id_'],
      createField: (item, widget: TableSelect) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableSelectField,
          preLocation: widget.id,
        });
        return fieldWidget;
      },
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
      return !widget.props.showPagination;
    },
  },
  {
    component: 'switch-editor',
    name: 'initLoad',
    label: 'sys.pageDesigner.initializeLoad',
    group: PropGroup.SHOW,
    dependentProps: ['model'],
    onMounted: (widget) => {
      if (!Object.prototype.hasOwnProperty.call(widget.props, 'initLoad')) {
        if (widget.props.initNotLoad === true) widget.props.initLoad = false;
        else widget.props.initLoad = true;
      }
    },
  },
  {
    component: 'switch-editor',
    name: 'index',
    label: 'sys.pageDesigner.showIndex',
    dependentProps: ['model'],
    group: PropGroup.SHOW,
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
    hidden(widget) {
      return !widget.props.customdataSource;
    },
  },
  ...displayEditor,
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

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (node: TableSelect) => {
  // node.children?.push(createWidgetByType(FormComponents.Search));
  // node.props.searchWidget = createWidgetByType(FormComponents.Search);
  const searchWidget = createWidgetByType(FormComponents.Search);
  searchWidget.materialType = MaterialEnum.MaterialTableSelectField;
  searchWidget.preLocation = node.id;
  const fields = {
    alias: '字段组',
    children: [],
  };
  const ope = createWidgetByType(FormComponents.DataTableOpe);
  ope.preLocation = node.id;
  node.children = [searchWidget, fields, ope];
};

/**
 * 1.列表选择器字段
 * 2.子表是模态框情况下的列字段
 * 走下面字段配置
 */
export const runPropEditor = (selectedRef, type = '') => {
  const propArr = [
    ...commonFieldEditorConfig.basicFieldEditor,
    ...(selectedRef.platform === Platform.MOBILE &&
    selectedRef.materialType === MaterialEnum.MaterialSubTableField
      ? []
      : columnEditorConfig.fixedAlignEditor),

    {
      component: 'switch-editor',
      name: 'refCard',
      label: 'sys.pageDesigner.refCardLabel',
      group: PropGroup.CARDDISPLAY,
      hidden(widget) {
        // return ![FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(widget.props.fieldType);
        return true;
      },
    },
    {
      component: 'gct-ref-card-editor',
      name: 'refCardId',
      label: '',
      group: PropGroup.CARDDISPLAY,
      hidden(widget) {
        return !widget.props.refCard;
      },
    },
    {
      component: 'radio-editor',
      name: 'cardTrigger',
      label: 'sys.pageDesigner.cardTrigger',
      group: PropGroup.CARDDISPLAY,
      _config: {
        options: Object.values(CARD_TRIGGER_ENUM).map((key) => {
          return { label: 'sys.pageDesigner.cardTriggerType.' + key, value: key };
        }),
      },
      formItemClass: 'in-row-editor',
      hidden(widget) {
        return !widget.props.refCard || widget.platform === Platform.MOBILE;
      },
      onMounted(widget) {
        if (widget.props.cardTrigger === undefined) {
          widget.props.cardTrigger = CARD_TRIGGER_ENUM.HOVER;
        }
      },
    },
    ...displayEditor,
  ];
  // 开关、枚举关联、枚举多选、模型关联、模型多选
  let types: any = [];
  if (type === 'subTable2Field') {
    types = [FormComponents.InputDouble, FormComponents.Inputnumber, FormComponents.Select];
  } else {
    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(selectedRef.props.fieldType)) {
      types = [FormComponents.Select];
    }
  }

  if (
    [FormComponents.Switch, FormComponents.Radio, FormComponents.Checkbox, ...types].includes(
      selectedRef.type,
    )
  ) {
    propArr.push(
      ...commonFieldEditorConfig.getBindCmpTypeEditor({
        name: 'bindCompStyleType',
        type: (widget) => {
          if ([FIELD_TYPE.INTEGER, FIELD_TYPE.LONG].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindNum;
          } else if ([FIELD_TYPE.DECIMAL, FIELD_TYPE.DOUBLE].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindDecimal;
          } else if (FIELD_TYPE.BOOLEAN === widget.props.fieldType) {
            return BindCmpStyleTypeEnum.BindBool;
          } else if ([FIELD_TYPE.ENUM, FIELD_TYPE.REF].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindLink;
          } else if (
            [FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.REF_MULTI].includes(widget.props.fieldType)
          ) {
            return BindCmpStyleTypeEnum.BindMulti;
          }
        },
        hiddenCallback(widget) {
          return [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY].includes(widget.props.fieldType);
        },
      }),
    );
  }

  if (FormComponents.AGG === selectedRef.type) {
    propArr.push(...aggBasicPropEditorList);
  }

  if (FormComponents.EXPRESSION === selectedRef.type) {
    propArr.push(...expressionBasicPropEditorList);
  }

  return propArr;
};
