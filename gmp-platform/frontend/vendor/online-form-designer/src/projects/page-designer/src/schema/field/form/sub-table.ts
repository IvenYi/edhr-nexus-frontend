import {
  PropGroup,
  FormComponents,
  SUB_TABLE_EDIT_MODE,
  TableEditingMethodEnum,
  Platform,
  sortTypeEnum,
  StyleGroup,
} from '/@page-designer/enum';
import { buildShortUUID } from '/@/utils/uuid';
import { SubTable, BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FIELD_TYPE, MaterialEnum } from '@/enums/appEnum';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { cloneDeep } from 'lodash-es';
import { beginDrag, createWidgetByType, setChildrenId } from '/@page-designer/schema/utils';
// import { eachTree } from '/@/utils/helper/treeHelper';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { widget as modal } from '/@page-designer/schema/modal/modal';
import { platform } from '/@page-designer/hooks/usePage';
import { useI18n } from '/@/hooks/web/useI18n';
import { useAsyncOperateField } from '/@page-designer/components/widgets/hooks/useAsyncFields';
import { deviceEvent } from '../../common-config/common-event-config';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

const { t } = useI18n();

const { asyncFieldAttr, asyncFieldInfo } = useAsyncOperateField();
const appInfoStore = useAppInfoStore();

/**单行操作按钮缓存 处理编辑按钮 在行内和弹框模式下的显示隐藏问题 */
const cacheData: any = {
  buttonChildren: [],
};
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<SubTable, 'platform' | 'children'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.SubTable,
  icon: '',
  dropPlaceholder: '请选择子表字段',
  props: {
    editMode: SUB_TABLE_EDIT_MODE.INLINE,
    bindModelKey: '',
    ...formItemProps,
    fieldType: FIELD_TYPE.MASTERSLAVE,
    editMethods: TableEditingMethodEnum.DEFAULTEDITING,
    rowDragSort: false,
    rowLimitOpen: false,
    rowLimit: 10,
    serialNumber: true,
    refMasterId: '',
    customdataSource: false,
    datasourceConfig: null,
    isFieldAsync: true,
    bindSubTableFormId: '',
    validateRule: [],
    showPagination: false,
    pageSize: 20,
    collation: [],
    layout: {
      label: 'left',
      inputBg: false,
      inputAlign: 'right',
    },
    hasLabelWidth: undefined,
    labelType: 'percent',
    labelWidth: 30,
    overLabelDisplay: undefined,
    isTree: false,
    cellHeightMode: TABLE_CELL_HEIGHT_MODE.ONE_ROW,
    cellHeight: 10,
    cellHeaderHeightSync: false,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};
export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),

  // 组件类型
  {
    component: 'subtable-type-select-editor',
    name: 'editMode',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.modal',
          value: SUB_TABLE_EDIT_MODE.MODAL,
        },
        {
          label: 'sys.pageDesigner.inline',
          value: SUB_TABLE_EDIT_MODE.INLINE,
        },
      ],
    },
    changeCallback: (widget: SubTable) => {
      // 切换到行内
      if (widget.props.editMode === SUB_TABLE_EDIT_MODE.INLINE) {
        cacheData.buttonChildren = [];
        if (widget?.children[1]?.children?.length) {
          cacheData.buttonChildren = widget?.children[1]?.children.filter((i) =>
            [FormComponents.SubTableEditBtn].includes(i.type),
          );
          widget.children[1].children = widget?.children[1]?.children.filter(
            (i) => ![FormComponents.SubTableEditBtn].includes(i.type),
          );
        }
      } else if (widget.props.editMode === SUB_TABLE_EDIT_MODE.MODAL) {
        // 切换到弹框
        widget.props.editMethods = TableEditingMethodEnum.DEFAULTEDITING;
        if (cacheData.buttonChildren.length) {
          widget?.children[1]?.children.push(...cacheData.buttonChildren);
        }
      }
    },
  },

  // 表格编辑方式
  {
    component: 'radio-editor',
    name: 'editMethods',
    label: 'sys.pageDesigner.editMethods',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget: SubTable) {
      if (widget.platform === Platform.MOBILE || widget.platform === Platform.PAD) {
        return true;
      }
      if (widget.props.editMode !== SUB_TABLE_EDIT_MODE.INLINE) {
        return true;
      }
      return widget.children[3].children.every((i) => i.props.readonly || i.props.fieldReadonly);
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
    component: 'mobile-form-layout-editor',
    name: 'layout',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: SubTable) {
      return [Platform.WEB, Platform.PAD].includes(widget.platform);
    },
  },
  {
    component: 'switch-editor',
    name: 'hasLabelWidth',
    label: 'sys.pageDesigner.hasLabelWidthConfig',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: SubTable) {
      return (
        [Platform.WEB, Platform.PAD].includes(widget.platform) ||
        widget.props.layout?.label !== 'left'
      );
    },
  },
  {
    component: 'label-width-editor',
    name: { labelType: 'labelType', labelWidth: 'labelWidth' },
    label: 'sys.pageDesigner.labelWidthTip',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: SubTable) {
      return (
        [Platform.WEB, Platform.PAD].includes(widget.platform) ||
        widget.props.layout?.label !== 'left' ||
        !widget.props.hasLabelWidth
      );
    },
  },
  {
    component: 'over-label-display-editor',
    name: 'overLabelDisplay',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: SubTable) {
      return (
        [Platform.WEB, Platform.PAD].includes(widget.platform) ||
        widget.props.layout?.label !== 'left' ||
        !widget.props.hasLabelWidth
      );
    },
  },
  // 行数据支持拖拽排序
  {
    component: 'switch-editor',
    name: 'rowDragSort',
    label: 'sys.pageDesigner.rowDragSort',
    group: PropGroup.FIELD_CONFIG,
  },
  // {
  //   component: 'switch-editor',
  //   name: 'showIndex',
  //   label: 'sys.pageDesigner.showIndex',
  //   dependentProps: ['rowDragSort'],
  //   group: PropGroup.FIELD_CONFIG,
  // },
  // 限制子表添加行数开关
  {
    component: 'switch-editor',
    name: 'rowLimitOpen',
    label: 'sys.pageDesigner.rowLimitOpen',
    group: PropGroup.FIELD_CONFIG,
  },
  // 限制子表添加行数
  {
    component: 'row-limit-editor',
    name: 'rowLimit',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return !widget.props.rowLimitOpen;
    },
  },
  {
    component: 'switch-editor',
    name: 'isTree',
    label: 'sys.pageDesigner.isTree',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return appInfoStore.appInfo.suiteKey !== 'eDHR';
    },
    changeCallback: (widget: SubTable) => {
      if (widget.props.isTree) {
        widget.props.serialNumber = false;
        widget.props.showPagination = false;
      }
    },
  },
  ...commonFieldEditorConfig.explainEditor,
  // 显示字段
  {
    component: 'field-formula-editor',
    name: 'root:children.3.children',
    label: '',
    group: PropGroup.FIELD,
    formItemStyle: { marginBottom: '12px' },
    _config: {
      createField: (item, widget: SubTable) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        fieldWidget.props.isCustomField = true;
        fieldWidget.props.label = fieldWidget.alias;
        fieldWidget.props.bindModelKey = widget.props.bindModelKey;
        if (widget.platform === Platform.MOBILE) {
          // 移动端子表中的数据，走表单模式，需单独处理
          fieldWidget.formItem = true;
          fieldWidget.props.displayLabelText = true;
        }
        return fieldWidget;
      },
    },
  },
  // 字段列表
  {
    component: 'table-field-list-editor',
    name: 'root:children.3.children',
    label: '',
    group: PropGroup.FIELD,
    formItemStyle: { marginBottom: '12px' },
    _config: {
      showcheckbox: true,
      supportSameField: true,
      selectFiledBtnTitle: 'sys.pageDesigner.selectFiledBtnTitle',
      excludeFieldType: [FIELD_TYPE.AGG],
      modelByKey: 'bindModelKey',
      createField: (item, widget: SubTable) => {
        // 【createField】 只有新建新的字段的时候才会走这个方法
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialSubTableField,
          preLocation: widget.id,
        });
        return fieldWidget;
      },
      updateAsyncField: asyncFieldAttr,
    },
    // 任何新增删除变动都会走【changeCallback】
    changeCallback: asyncFieldInfo,
  },

  // 显示表格序号
  {
    component: 'switch-editor',
    name: 'serialNumber',
    label: 'sys.pageDesigner.displayTableNumber',
    group: PropGroup.SHOW,
    hidden(widget) {
      return widget.props.isTree;
    },
  },
  // 是否显示分页
  {
    component: 'switch-editor',
    name: 'showPagination',
    label: 'sys.pageDesigner.pagination',
    group: PropGroup.SHOW,
    hidden(widget) {
      return widget.platform !== Platform.WEB || widget.props.isTree;
    },
  },
  // 分页配置
  {
    component: 'page-editor',
    name: 'pageSize',
    label: '',
    group: PropGroup.SHOW,
    hidden(widget) {
      return !widget.props.showPagination;
    },
  },
  {
    component: 'panel-divider-editor',
    name: 'divider',
    group: PropGroup.SHOW,
    label: '',
    hidden(widget) {
      return platform.value !== Platform.WEB;
    },
  },
  {
    component: 'gct-table-cell-height-editor',
    name: { cellHeightMode: 'cellHeightMode', cellHeight: 'cellHeight' },
    label: 'sys.pageDesigner.cellHeightMode',
    group: PropGroup.SHOW,
    hidden(widget) {
      return platform.value !== Platform.WEB;
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
      return platform.value !== Platform.WEB;
    },
    _config: {
      label: 'sys.pageDesigner.cellHeaderHeightSync',
    },
  },
  // 排序字段
  {
    component: 'sorts-editor',
    label: '',
    name: 'collation',
    group: PropGroup.LISTDATA,
    hidden(widget) {
      return widget.props.rowDragSort === true;
    },
    _config: {
      getModelKey: (widget: SubTable) => {
        return widget.props.bindModelKey;
      },
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
      // headerLeft: { value: '', visibleButtons: '' },
      columns: {
        value: 'root:children.1.children',
        visibleButtons: 'root:children.1.props.visibleButtons',
      },
    },
    dependentProps: ['editMode'],
    group: PropGroup.LISTBUTTON,
    _config: {
      /**添加按钮的回调 */
      eventCallback(widget: BaseButton) {
        widget.parentComponent = FormComponents.SubTable;
        if (widget.platform === Platform.MOBILE) {
          widget.props.type = 'default';
          widget.props.backgroundColor = widget.props.backgroundColor || '#026AC8';
          widget.props.fontColor = widget.props.fontColor || '#026AC8';
          widget.props.enableCustomColor = true;
        }
      },
      modelKey: 'bindModelKey',
      headerRightMaxValue: 3,
      columnsMaxValue: 3,
      headerRightButton: (widget) => {
        if ([Platform.MOBILE, Platform.PAD].includes(widget.platform)) {
          return [FormComponents.CustomButton, FormComponents.SubTableAddBtn];
        } else {
          return [
            FormComponents.CustomButton,
            FormComponents.SubTableAddBtn,
            FormComponents.ImportButton,
            FormComponents.ExportButton,
          ];
        }
      },
      columnsButton: (widget) => {
        if (widget.platform === Platform.PAD) {
          return [
            FormComponents.CustomButton,
            FormComponents.SubTableEditBtn,
            FormComponents.SubTableDeleteBtn,
            FormComponents.SubTableCopyBtn,
          ];
        } else if (widget.props.editMode === SUB_TABLE_EDIT_MODE.INLINE) {
          return [
            FormComponents.CustomButton,
            FormComponents.SubTableDeleteBtn,
            FormComponents.SubTableCopyBtn,
          ];
        } else {
          return [
            FormComponents.CustomButton,
            FormComponents.SubTableEditBtn,
            FormComponents.SubTableDeleteBtn,
            FormComponents.SubTableCopyBtn,
          ];
        }
      },
    },
  },
  // 按钮
  // {
  //   component: 'add-button-list-editor',
  //   label: 'sys.pageDesigner.buttonZone',
  //   name: { list: 'root:children.1.children', cmpId: 'root:id', model: 'bindModelKey' },
  //   group: PropGroup.LISTBUTTON,
  //   _config: {
  //     createField: () => createWidgetByType(FormComponents.BaseButton),
  //     options: (widget: SubTable) => {
  //       if (widget.props.editMode === SUB_TABLE_EDIT_MODE.INLINE) {
  //         return SUB_TABLE_OPE_EVENT_TYPE_INLINE;
  //       } else if (widget.props.editMode === SUB_TABLE_EDIT_MODE.MODAL) {
  //         return SUB_TABLE_OPE_EVENT_TYPE;
  //       }
  //     },
  //     defaultButtonType: {
  //       hasIcon: false,
  //       hasText: true,
  //       type: ButtonType.LINK,
  //     },
  //   },
  // },
  // {
  //   component: 'button-show-num-editor',
  //   name: 'visibleButtons',
  //   label: '',
  //   group: PropGroup.ButtonShow,
  //   changeCallback: (widget, val: any) => {
  //     const props = widget.children![1].props;
  //     if (props) {
  //       props.visibleButtons = val;
  //     }
  //   },
  //   hidden: (widget: SubTable) => {
  //     return !widget.children![1].children.length;
  //   },
  //   _config: {
  //     max: (widget) => (widget.platform === Platform.WEB ? 5 : 3),
  //   },
  // },

  // 自定义数据源开关
  {
    component: 'switch-editor',
    name: 'customdataSource',
    label: 'sys.pageDesigner.customDataSource',
    group: PropGroup.DATASOURCE,
  },
  // 自定义数据源
  {
    component: 'data-sourse-editor',
    name: 'datasourceConfig',
    label: '',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return !widget.props.customdataSource;
    },
  },
  ...commonFieldEditorConfig.validatorEditor,
  {
    component: 'validate-editor',
    name: 'validateRule',
    label: '',
    group: PropGroup.VALIDATERULE,
    _config: {
      modelKey: 'bindModelKey',
    },
  },
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
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
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
  },
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeDataLoad',
    title: 'sys.pageDesigner.beforeDataLoad',
    params: ['value', 'formData'],
  },
  {
    name: 'cellClickEvent',
    title: 'sys.pageDesigner.cellClickEvent',
    params: ['value', 'formData'],
  },
  ...deviceEvent,
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {
  cacheData.buttonChildren = [];
};

const _initModalInfo = (node) => {
  const modalSchema = cloneDeep(modal);
  modalSchema.id = buildShortUUID(modalSchema.type);
  modalSchema.platform = platform.value;
  modalSchema.alias = t(modalSchema.name);
  modalSchema.props.isSubTableModal = true;
  modalSchema.props.bindSubTableId = node.id;
  if (node.platform === Platform.PAD) {
    modalSchema.props.unitType = '%';
    modalSchema.props.modalWidth = 60;
  }
  setChildrenId(modalSchema);
  const form = createWidgetByType(FormComponents.Form);
  form.props.model = node.props.bindModelKey;
  form.preLocation = node.id;

  modalSchema.children[0].children.push(form);
  return {
    modalSchema,
    bindSubTableFormId: form.id,
  };
};

export const beforeCreate = async (node: SubTable) => {
  const { modalSchema, bindSubTableFormId } = _initModalInfo(node);
  let ope;
  if (node.platform === Platform.WEB || node.platform === Platform.PAD) {
    ope = createWidgetByType(FormComponents.DataTableOpe);
  } else if (node.platform === Platform.MOBILE) {
    ope = createWidgetByType(FormComponents.CardOpeBtn);
  }
  ope.preLocation = node.id;
  ope.id = undefined;
  const btnGroup = {
    preLocation: node.id,
    model: node.props.bindModelKey,
    visibleButtons: 3,
    children: [],
  };
  const fields = {
    alias: '字段组',
    children: [] as any[],
  };

  node.children = [modalSchema, ope, btnGroup, fields];
  node.props.bindSubTableFormId = bindSubTableFormId;

  node.props.collation = [
    {
      collationField: 'sort_num_',
      collationSort: sortTypeEnum.ASC,
    },
  ];
};
