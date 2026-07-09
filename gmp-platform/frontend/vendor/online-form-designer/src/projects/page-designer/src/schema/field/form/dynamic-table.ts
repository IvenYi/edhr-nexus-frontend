import {
  PropGroup,
  FormComponents,
  SUB_TABLE_EDIT_MODE,
  TableEditingMethodEnum,
  Platform,
  StyleGroup,
  SUB_TABLE_OPE_EVENT_TYPE,
  SUB_TABLE_OPE_EVENT_TYPE_INLINE,
  ButtonType,
} from '/@page-designer/enum';
import { buildShortUUID } from '/@/utils/uuid';
import { DynamicTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { CreateType, FIELD_TYPE, MaterialEnum } from '@/enums/appEnum';
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
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

const { t } = useI18n();

const { asyncFieldAttr, asyncFieldInfo } = useAsyncOperateField();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<DynamicTable, 'platform' | 'children'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.DynamicTable,
  icon: '',
  props: {
    editMode: SUB_TABLE_EDIT_MODE.INLINE,
    bindModelKey: '',
    ...formItemProps,
    fieldType: FIELD_TYPE.MASTERSLAVE,
    editMethods: TableEditingMethodEnum.DEFAULTEDITING,
    rowLimitOpen: false,
    rowLimit: 10,
    /**可见按钮数量 */
    visibleButtons: 1,
    serialNumber: true,
    showPagination: false,
    pageSize: 20,
    refMasterId: '',
    customdataSource: false,
    datasourceConfig: null,
    isFieldAsync: true,
    bindSubTableFormId: '',
    rowDragSort: false,
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
    changeCallback(widget: DynamicTable) {
      // 切换到行内
      if (widget.props.editMode === SUB_TABLE_EDIT_MODE.INLINE) {
        widget.children[1].children = widget.children[1].children.filter((item) => {
          if (!item.props.innerEvent) {
            return true;
          }
          return item.props.innerEvent && !['edit', 'copy'].includes(item.props.sysMethedType);
        });
      }
    },
  },

  // 表格编辑方式
  {
    component: 'radio-editor',
    name: 'editMethods',
    label: 'sys.pageDesigner.editMethods',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget: any) {
      if (widget.platform === Platform.MOBILE) {
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
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  // 显示字段
  {
    component: 'field-formula-editor',
    name: 'root:children.3.children',
    label: '',
    group: PropGroup.FIELD,
    _config: {
      createField: (item, widget: DynamicTable) => {
        // const field = createWidgetByType(item.createType);
        // field.alias = item.label;
        // field.props.label = item.label;
        // field.i18n!.label = item.labeli18n;
        // field.props.remark = item.remark;
        // field.props.model = widget.props.modelKey;
        // field.preLocation = widget.id;
        // field.props.bindModelKey = widget.props.bindModelKey;
        // field.props.fieldType = FormComponents.DataTableFormula ? item.type : 'text';
        // field.props.field =
        //   item.createType === FormComponents.DataTableFormula ? field.id : item.key;
        // field.props.isCustomField = true;
        // if (item.createType === FormComponents.ReadonlyCmp) {
        //   field.name = 'sys.pageDesigner.custom';
        //   field.icon = 'icon-zidingyixianshiziduan';
        // } else {
        //   field.props.formula = item.formula;
        // }
        // if (widget.platform === Platform.MOBILE) {
        //   // 移动端子表中的数据，走表单模式，需单独处理
        //   field.formItem = true;
        //   field.props.displayLabelText = true;
        // }
        // return field;
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        fieldWidget.props.isCustomField = true;
        fieldWidget.props.label = fieldWidget.alias;
        fieldWidget.props.bindModelKey = widget.props.bindModelKey;
        console.log('d-fieldWidget', fieldWidget);
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
      selectFiledBtnTitle: 'sys.pageDesigner.selectFiledBtnTitle',
      excludeFieldType: [FIELD_TYPE.AGG],
      modelByKey: 'bindModelKey',
      excludeFieldKey: ['ref_master_id_'],
      createField: (item, widget: DynamicTable) => {
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
  // 行数据支持拖拽排序
  {
    component: 'switch-editor',
    name: 'rowDragSort',
    label: 'sys.pageDesigner.rowDragSort',
    group: PropGroup.FIELD_CONFIG,
  },
  // 显示表格序号
  {
    component: 'switch-editor',
    name: 'serialNumber',
    label: 'sys.pageDesigner.displayTableNumber',
    group: PropGroup.SHOW,
    hidden: (widget) => {
      return widget.platform === Platform.MOBILE;
    },
  },
  // 是否显示分页
  {
    component: 'switch-editor',
    name: 'showPagination',
    label: 'sys.pageDesigner.pagination',
    group: PropGroup.SHOW,
    hidden(widget) {
      return widget.platform !== Platform.WEB;
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
  // 按钮
  // {
  //   component: 'add-button-list-editor',
  //   label: 'sys.pageDesigner.buttonZone',
  //   name: { list: 'root:children.1.children', cmpId: 'root:id', model: 'bindModelKey' },
  //   group: PropGroup.LISTBUTTON,
  //   _config: {
  //     createField: () => createWidgetByType(FormComponents.BaseButton),
  //     options: (widget: DynamicTable) => {
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
  {
    component: 'gct-table-button-group-editor',
    label: '',
    name: {
      headerRight: {
        value: 'root:children.2.children',
        visibleButtons: 'root:children.2.visibleButtons',
      },
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
        if (widget.platform === Platform.MOBILE) {
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
        if (widget.props.editMode === SUB_TABLE_EDIT_MODE.INLINE) {
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
  // {
  //   component: 'button-show-num-editor',
  //   name: 'visibleButtons',
  //   label: '',
  //   group: PropGroup.ButtonShow,
  //   hidden: (widget) => {
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

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

const _initModalInfo = (node) => {
  const modalSchema = cloneDeep(modal);
  modalSchema.id = buildShortUUID(modalSchema.type);
  modalSchema.platform = platform.value;
  modalSchema.alias = t(modalSchema.name);
  modalSchema.props.isSubTableModal = true;
  modalSchema.props.bindSubTableId = node.id;

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

export const beforeCreate = async (node: DynamicTable) => {
  const { modalSchema, bindSubTableFormId } = _initModalInfo(node);

  let ope;
  if (node.platform === Platform.WEB) {
    ope = createWidgetByType(FormComponents.DataTableOpe);
  } else if (node.platform === Platform.MOBILE) {
    ope = createWidgetByType(FormComponents.CardOpeBtn);
  }

  ope.preLocation = node.id;

  const btnGroup = createWidgetByType(FormComponents.ButtonContainer);
  btnGroup.preLocation = node.id;
  btnGroup.props.model = node.props.bindModelKey;
  const fields = {
    alias: '字段组',
    children: [] as any[],
  };

  const list = await getFieldMetaList({ modelKey: node.props.bindModelKey });

  list
    ?.filter((item) => {
      return (
        item.createType == CreateType.BUILTIN &&
        item.key !== 'model_object_' &&
        item.key !== 'ref_model_key_' &&
        item.key !== 'ref_field_key_' &&
        item.key !== 'ref_master_id_'
      );
    })
    .forEach((item: any) => {
      const fieldWidget = beginDrag(item, {
        materialType: MaterialEnum.MaterialSubTableField,
        preLocation: widget.id,
      });
      fieldWidget.props.bindModelKey = node.props.bindModelKey;
      fields.children.push(fieldWidget);
    });

  node.children = [modalSchema, ope, btnGroup, fields];
  node.props.bindSubTableFormId = bindSubTableFormId;

  asyncFieldInfo(node, fields.children);
};
