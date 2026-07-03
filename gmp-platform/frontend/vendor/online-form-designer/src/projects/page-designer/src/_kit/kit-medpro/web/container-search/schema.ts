import { Component, defineAsyncComponent } from 'vue';
import {
  BindCmpStyleEnum,
  EntityModelCategoryEnum,
  FieldMetaDTO,
  FormComponents,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { ColumnTable, Form, SelectSearchProps } from '/@page-designer/types/web';
import {
  displayProps,
  displayEditor,
} from '/@page-designer/schema/common-config/display-editor-config';
import {
  styleEditorList,
  resultFieldType,
  searchFieldType,
} from '/@page-designer/schema/web/other/select-search';
import { KitType } from '../../../enums';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { beginDrag, createWidgetByType, createFieldWidgetByType } from '../../../../schema/utils';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';

export interface IContainerSearchProps extends SelectSearchProps {
  model: string;
  txnType: string;
  title: string;
  required: boolean;
  showResultFields: string[];
  notGoodContainer: boolean; // 是否包含不良批次
  showPackagingContainer: boolean; // 展示包装批次
  actionKey: string; // 事务模型执行查询执行方法
  modelData: { modelCategory: EntityModelCategoryEnum };
  defaultModelKey: string;
  maxLength: number;
  rowLength: number;
  searchModify: number;
}

export interface IContainerSearch extends LowCodeWidget.BasicSchema {
  props: IContainerSearchProps;
  children: [ColumnTable[], Form, any];
}
// 批次模型
const containerModelKey = 'em_container';

export function genComponentFields(fieldData: FieldMetaDTO[] = [], resultFields): ColumnTable[] {
  const compList: Array<any> = [];
  resultFields.forEach((e) => {
    const field: any = fieldData.find((f) => f.key === e) || {};
    const comp = beginDrag(field, {
      materialType: MaterialEnum.MaterialTableField,
    });
    compList.push(comp);
  });

  return compList ?? [];
}

export default class MedProContainerSearch implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./container-search-designer.vue'));

  schema: IContainerSearch = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.medPro.containerSearch',
    alias: '',
    type: 'medpro' + KitType.CONTAINER_SEARCH,
    displayName: 'sys.kit.medPro.containerSearch',
    icon: 'icon-sousuo',
    children: [[], null] as any as [ColumnTable[], Form],
    props: {
      title: '${sys.kit.medPro.containerSearchTitle}',
      model: containerModelKey,
      txnType: '',
      modelData: { modelCategory: EntityModelCategoryEnum.ENTITY },
      multiple: false,
      notGoodContainer: false,
      showPackagingContainer: false,
      actionKey: 'biz_search',
      defaultModelKey: containerModelKey,
      quickSearchFields: [],
      searchResultFields: [],
      showResultFields: [],
      rowLength: 5,
      maxLength: 10,
      searchModify: 13, // 触发搜索键盘修饰符
      placeholder: '${sys.pageDesigner.search}',
      ...displayProps,
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
      group: PropGroup.SEARCH,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    // 事务模型：默认不选（查批次表）
    {
      component: 'select-editor',
      name: 'txnType',
      label: 'sys.kit.medPro.txnType',
      required: false,
      group: PropGroup.SEARCH,
      _config: {
        tips: 'sys.kit.medPro.txnTips',
        showSearch: true,
        multiple: false,
        options: async (widget) => {
          const modelList =
            (await getModelComprehensiveModelSummary({
              type: 'TRANSACTION',
              category: widget.props.modelData.modelCategory ?? EntityModelCategoryEnum.ENTITY,
            })) ?? [];
          return modelList.map((model) => {
            return {
              label: model.name,
              value: model.key,
            };
          });
        },
      },
      changeCallback: async (widget) => {
        const workflowNode = createFieldWidgetByType(FormComponents.WorkflowNodes);
        widget.children[2] = ['em_txn_move', 'em_txn_move_in'].includes(widget.props.txnType)
          ? workflowNode
          : {};
      },
    },
    // 是否包含不良批次
    {
      component: 'switch-editor',
      name: 'notGoodContainer',
      label: 'sys.kit.medPro.notGoodTips',
      required: false,
      group: PropGroup.SEARCH,
    },
    // 展示包装批次
    {
      component: 'switch-editor',
      name: 'showPackagingContainer',
      label: '展示包装批次',
      required: false,
      group: PropGroup.SEARCH,
    },
    // 快速搜索字段
    {
      component: 'select-editor',
      name: 'quickSearchFields',
      label: 'sys.pageDesigner.quickSearchFields',
      group: PropGroup.SEARCH,
      required: true,
      _config: {
        showSearch: true,
        multiple: true,
        maxMultiple: 5,
        tips: 'sys.pageDesigner.quickSearchTips',
        options: async () => {
          const data = (await getFieldMetaList({ modelKey: containerModelKey })) || [];
          return data
            ?.filter((e) => searchFieldType.some((f) => f === e.type))
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        },
      },
    },
    // 搜索结果字段
    {
      component: 'table-field-list-editor',
      name: 'root:children.0',
      label: 'sys.pageDesigner.searchResultFields',
      group: PropGroup.SEARCH,
      changeCallback: async (widget) => {
        widget.props.searchResultFields = widget.children[0];
      },
      _config: {
        modelByKey: 'defaultModelKey',
        showcheckbox: false,
        createField: (item, widget: IContainerSearch) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          fieldWidget.props.isCustomField = false;
          return fieldWidget;
        },
      },
    },
    // 搜索终止符
    {
      component: 'select-editor',
      name: 'searchModify',
      label: 'sys.kit.medPro.searchModify',
      group: PropGroup.SEARCH,
      required: false,
      _config: {
        showSearch: true,
        multiple: true,
        maxMultiple: 5,
        tips: 'sys.kit.medPro.searchModifyTips',
        options: [
          {
            label: '回车',
            value: 13,
          },
          {
            label: 'Tab',
            value: 9,
          },
          {
            label: '空格',
            value: 32,
          },
        ],
      },
    },
    {
      component: 'input-attr-editor',
      name: '',
      label: 'sys.pageDesigner.inputAttr',
      group: PropGroup.INPUT_CONFIG,
      _config: {
        needFieldAttrs: ['required'],
      },
    },
    {
      component: 'text-editor',
      name: 'placeholder',
      label: 'sys.pageDesigner.fieldPlaceholder',
      group: PropGroup.INPUT_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
      hidden(widget) {
        return (
          widget.props.bindFieldKey ||
          widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_TIME ||
          widget.props.readonly ||
          widget.props.fieldReadonly
        );
      },
    },
    // 展示字段
    {
      // 1. 新建显示字段
      component: 'field-formula-editor',
      name: 'root:children.1.children',
      label: '',
      group: PropGroup.SHOW,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        createField: (item, widget: IContainerSearch) => {
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
      // 2. 选择模型字段
      component: 'table-field-list-editor',
      name: 'root:children.1.children',
      label: '',
      group: PropGroup.SHOW,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        modelByKey: 'defaultModelKey',
        showcheckbox: false,
        createField: (item, widget: IContainerSearch) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
        },
      },
    },
    // 单行显示个数
    {
      component: 'number-editor',
      name: 'rowLength',
      label: 'sys.pageDesigner.NumberOfSingleLineDisplays',
      group: PropGroup.SHOW,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 5,
      },
    },
    // 最多显示个数
    {
      component: 'number-editor',
      name: 'maxLength',
      label: 'sys.pageDesigner.MaximumNumberOfDisplays',
      group: PropGroup.SHOW,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 20,
      },
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeSearch',
      title: 'sys.pageDesigner.beforeSearch',
      params: ['value', 'data'],
    },
    {
      name: 'afterClear',
      title: 'sys.pageDesigner.afterClear',
      params: [],
    },
    {
      name: 'afterSelect',
      title: 'sys.pageDesigner.afterSelect',
      params: ['data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...styleEditorList];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    widget.children = [[], null];
    const form = createWidgetByType(FormComponents.Form);
    form.alias = '批次表单';
    form.children = [];
    form.props.model = widget.props.model || widget.props.defaultModelKey;
    // @ts-ignore
    form.props.useType = 'CONTAIN_SEARCH';
    widget.children[1] = form;
  };
}
