import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  ButtonStyle,
  PropGroup,
  sortTypeEnum,
  RowSelectionTypeEnums,
  FormComponents,
  MaterialEnum,
  AGLINE_ENUMS,
  CreateType,
  FIELD_TYPE,
  searchListByFieldType,
} from '@gct/runtime';
import { ButtonProps, TableSelect } from '/@page-designer/types/web';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import {
  buttonEditor,
  buttonStyleEditor,
} from '/@page-designer/schema/common-config/button-editor-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import { createWidgetByType, beginDrag, createdSearchField } from '/@page-designer/schema/utils';

export interface assignmentRule {
  assignment: string;
  enableNoRepeat: Boolean;
  noRepeatId?: string;
  refTable: string;
  sourceTab: string;
  rules?: { from: string; to: string }[];
}

export interface ITableSelectButtonProps extends ButtonProps {
  title: string;
  modelByKey: string;
  modalTitle: string;
  assignmentRule: assignmentRule;
  tableSelect: TableSelect;
}

export interface ITableSelectButton extends LowCodeWidget.BasicSchema {
  props: ITableSelectButtonProps;
  children?: [];
}

export class TableSelectBtnConfig implements IDesignerProvider {
  kit: string[] = ['WMS'];

  component: Component = defineAsyncComponent(() => import('./table-select-button-designer.vue'));

  schema: ITableSelectButton = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.addMaterial',
    alias: '',
    type: KitType.TABLE_SELECT_BUTTON,
    display: DisplayEnums.INLINE_BLOCK,
    displayName: 'sys.kit.addMaterial',
    icon: 'icon-liebiaoxuanzeqi',

    props: {
      ...baseBtnProp,
      title: '${sys.kit.addMaterial}',
      modelByKey: undefined,
      modalTitle: '${sys.kit.selectMaterial}',
      assignmentRule: undefined,
      tableSelect: {
        props: {
          showPagination: false,
          pageSize: 20,
          search: true,
          index: false,
          rowSelectionType: RowSelectionTypeEnums.MultipleChoice,
          model: undefined,
          datafilter: [],
          collation: [],
          initLoad: true,
          parentModelSelection: false,
          refParentModelkey: '',
          customdataSource: false,
          datasourceConfig: null,
        },
        // children:[]
      } as any as TableSelect,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'radio-editor',
      name: 'buttonStyle',
      label: 'sys.pageDesigner.buttonStyle',
      group: PropGroup.ButtonStyle,
      _config: {
        options: Object.values(ButtonStyle).map((key) => {
          return { label: 'sys.pageDesigner.' + key, value: key };
        }),
      },
    },
    {
      component: 'text-editor',
      name: 'modalTitle',
      label: 'sys.pageDesigner.modalTitleName',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'model-editor',
      name: 'tableSelect.props.model',
      label: 'sys.pageDesigner.listSelectorModel',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      changeCallback: (widget: ITableSelectButton) => {
        widget.props.modelByKey = widget.props.tableSelect.props.model!;
        widget.props.tableSelect.props.parentModelSelection = false;
        widget.props.tableSelect.props.refParentModelkey = '';
        widget.props.tableSelect.children[0]!.props.model = widget.props.tableSelect.props.model;
        widget.props.tableSelect.children[0]!.props.modeldata = widget.props.modeldata!;
        widget.props.tableSelect.children[0]!.props.exp = '';
        widget.props.tableSelect.children[0].children = [];
        widget.props.tableSelect.children[1].children = [];
        widget.props.tableSelect.props.showPagination = false;
        widget.props.tableSelect.props.pageSize = 20;
        widget.props.tableSelect.props.initLoad = true;
        widget.props.tableSelect.props.index = false;
        widget.props.tableSelect.props.datafilter = [];
        widget.props.tableSelect.props.collation = [
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

    // 筛选项
    {
      component: 'field-list-editor',
      name: 'tableSelect.children.0.children',
      label: 'sys.pageDesigner.listSelectorFilters',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        modelByKey: 'modelByKey',
        createField: (item, widget) => {
          const {
            key: field,
            id: fieldId,
            type,
            name: label,
            bindInfo: bindModelKey,
            modelKey,
            mappingType,
            refModelType,
          } = item;
          const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type)
            ? mappingType
            : type;
          const fieldName = item.name;
          const fieldCodeChain = JSON.stringify({ modelKey: item.modelKey });
          return createdSearchField({
            field,
            fieldId,
            fieldType,
            label,
            fieldName,
            fieldCodeChain,
            bindModelKey,
            modelKey,
            refModelType,
            type,
            preLocation: widget.id,
          });
        },
        filterFn: (item) => {
          const { modelType } = item;
          if (modelType === 'RDO') {
            return item.createType === CreateType.BUILTIN && item.key === 'name_';
          }
          return (
            ([CreateType.USER_DEFINED, CreateType.BUILTIN].includes(item.createType) &&
              searchListByFieldType.includes(item.type)) ||
            ([CreateType.SYSTEM].includes(item.createType as CreateType) &&
              [
                'create_user_id_',
                'create_time_',
                'modify_user_id_',
                'modify_time_',
                'create_org_id_',
                'modify_org_id_',
              ].includes(item.key ?? '')) ||
            item.createType === CreateType.BUILTIN
          );
        },
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },

    // 查询规则
    {
      component: 'search-rule-editor',
      name: 'tableSelect.children.0.props.exp',
      label: 'sys.pageDesigner.queryRules',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        getSearchWidgets(widget: ITableSelectButton) {
          const list = [];
          const searchRef = widget.props?.tableSelect.children[0] || {};
          searchRef.children?.forEach((i: any) => {
            i.props.label = i.props.label || i.alias;
            list.push(i);
          });
          return list;
        },
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    // 单行显示个数
    {
      component: 'number-editor',
      name: 'tableSelect.children.0.props.rowLength',
      label: 'sys.pageDesigner.NumberOfSingleLineDisplays',
      group: PropGroup.BUSINESS_CONFIG,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 5,
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    // 最多显示个数
    {
      component: 'number-editor',
      name: 'tableSelect.children.0.props.maxLength',
      label: 'sys.pageDesigner.MaximumNumberOfDisplays',
      group: PropGroup.BUSINESS_CONFIG,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 20,
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    // 按钮对齐方式
    {
      component: 'align-editor',
      name: 'tableSelect.children.0.props.alignment',
      label: 'sys.pageDesigner.buttonAlignment',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        options: [
          { label: AGLINE_ENUMS.LEFT, value: 'icon-zuoduiqi1' },
          { label: AGLINE_ENUMS.CENTER, value: 'icon-juzhongduiqi1' },
          { label: AGLINE_ENUMS.RIGHT, value: 'icon-youduiqi1' },
        ],
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    // 自定义筛选项
    {
      component: 'switch-editor',
      name: 'tableSelect.children.0.props.customHeader',
      label: 'sys.pageDesigner.customFilterItems',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },

    {
      component: 'table-field-list-editor',
      name: 'tableSelect.children.1.children',
      label: 'sys.pageDesigner.listSelectorFeilds',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      hidden(widget) {
        return !widget.props.tableSelect.props.model;
      },
      _config: {
        draggable: true,
        modelByKey: 'modelByKey',
        createField: (item, widget: ITableSelectButton) => {
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
      name: 'tableSelect.props.showPagination',
      label: 'sys.pageDesigner.pagination',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    {
      component: 'page-editor',
      name: 'tableSelect.props.pageSize',
      label: '',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget) {
        return !(
          widget.props.tableSelect.props.model && widget.props.tableSelect.props.showPagination
        );
      },
    },
    {
      component: 'switch-editor',
      name: 'tableSelect.props.initLoad',
      label: 'sys.pageDesigner.initializeLoad',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
      onMounted: (widget) => {
        if (!Object.prototype.hasOwnProperty.call(widget.props.tableSelect.props, 'initLoad')) {
          if (widget.props.tableSelect.props.initNotLoad === true)
            widget.props.tableSelect.props.initLoad = false;
          else widget.props.tableSelect.props.initLoad = true;
        }
      },
    },
    {
      component: 'switch-editor',
      name: 'tableSelect.props.index',
      label: 'sys.pageDesigner.showIndex',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    {
      component: 'data-filtering-new-editor',
      label: '',
      name: 'tableSelect.props.datafilter',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        modelKey: 'modelByKey',
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },
    {
      component: 'sorts-editor',
      label: '',
      name: 'tableSelect.props.collation',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        getModelKey: (widget: ITableSelectButton) => {
          return widget.props.tableSelect.props.model;
        },
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.props.model;
      },
    },

    // 自定义筛选项
    {
      component: 'assignment-rule-editor',
      name: 'assignmentRule',
      label: 'sys.pageDesigner.assignmentRule',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        modelByKey: 'modelByKey',
      },
      hidden(widget: ITableSelectButton) {
        return !widget.props.tableSelect.children[1].children?.length;
      },
    },
    ...(displayEditor as any),
    ...(buttonEditor as any),
    ...(permissionEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    // {
    //   name: 'beforeExecute',
    //   title: 'sys.pageDesigner.beforeExecute',
    //   params: ['formdata'],
    // },
    // {
    //   name: 'afterExecute',
    //   title: 'sys.pageDesigner.afterExecute',
    //   params: ['id'],
    // },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

  beforeCreate?: LowCodeWidget.beforeCreate = async (node: ITableSelectButton) => {
    // 初始化批次相关信息
    const tableSelectWidget = createWidgetByType(FormComponents.TableSelect);
    tableSelectWidget.materialType = MaterialEnum.MaterialTableSelectField;
    tableSelectWidget.preLocation = node.id;
    node.children = [];
    node.props.tableSelect = tableSelectWidget;
    node.props.tableSelect.props.rowSelectionType = RowSelectionTypeEnums.MultipleChoice;
    node.props.tableSelect.props.search = true;
    console.log(node, 'node.children');
  };
}
