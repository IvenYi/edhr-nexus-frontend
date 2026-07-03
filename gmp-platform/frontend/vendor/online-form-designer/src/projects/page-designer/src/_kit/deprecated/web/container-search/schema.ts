import {
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
  eventList,
  resultFieldType,
  searchFieldType,
} from '/@page-designer/schema/web/other/select-search';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
// import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';

export interface IContainerSearchProps extends SelectSearchProps {
  title: string;
  showResultFields: string[];
  inclueBad: boolean; // 是否包含不良批次
  form: Form;
  actionKey: string; // 事务模型执行查询执行方法
  isQueryContainer: boolean;
}

export interface IContainerSearch extends LowCodeWidget.BasicSchema {
  props: IContainerSearchProps;
  children: ColumnTable[];
}

const containerModelKey = 'em_container';

/**
 * 批次查询列表展示字段: ⬇️⬇️⬇️⬇️⬇️
 * [批次名称，批次等级（形态），产品，工作流，工站，工单，批次状态，当前工艺，数量]
 */
const searchResultFields = [
  'name_',
  'container_modality_id_',
  'product_id_',
  'workflow_id_',
  'operation_id_',
  'mfg_order_id_',
  'status_',
  'spec_id_',
  'qty_',
];

const showResultFields = ['product_id_', 'operation_id_', 'spec_id_', 'mfg_order_id_', 'qty_'];

const quickSearchFields = ['name_'];

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

export class ContainerSearchConfig implements IDesignerProvider {
  kit: string[] = ['MEDPROOLD'];

  component: Component = defineAsyncComponent(() => import('./container-search-designer.vue'));

  schema: IContainerSearch = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.containerSearch',
    alias: '',
    type: KitType.CONTAINER_SEARCH,
    displayName: '批次查询',
    icon: 'icon-sousuo',
    children: [],
    props: {
      title: '批次信息',
      isQueryContainer: false,
      model: undefined,
      modeldata: { modelCategory: EntityModelCategoryEnum.ENTITY },
      multiple: false,
      inclueBad: false,
      actionKey: 'biz_search',
      defaultModelKey: containerModelKey,
      quickSearchFields: quickSearchFields,
      searchResultFields: searchResultFields,
      showResultFields: showResultFields,
      placeholder: '${sys.pageDesigner.search}',
      form: undefined as any as Form,
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
    {
      component: 'switch-editor',
      name: 'inclueBad',
      label: 'sys.kit.containerTips',
      required: false,
      group: PropGroup.SEARCH,
    },
    //是否是指查询批次
    {
      component: 'switch-editor',
      name: 'isQueryContainer',
      label: 'sys.kit.containerSearch',
      required: false,
      group: PropGroup.SEARCH,
      changeCallback(widget, value) {
        if (value) {
          widget.props.model = 'em_container';
        }
      },
    },
    // 事务模型
    {
      component: 'select-editor',
      name: 'model',
      label: 'sys.kit.txnType',
      required: true,
      group: PropGroup.SEARCH,
      _config: {
        tips: 'sys.kit.txnTips',
        showSearch: true,
        multiple: false,
        options: async (widget) => {
          const modelList =
            (await getModelComprehensiveModelSummary({
              type: 'TRANSACTION',
              category: widget.props.modeldata.modelCategory ?? EntityModelCategoryEnum.ENTITY,
            })) ?? [];
          return modelList.map((model) => {
            return {
              label: model.name,
              value: model.key,
            };
          });
        },
      },
      changeCallback(widget) {
        widget.props.actionKey = '';
      },
      hidden(widget) {
        return widget.props.isQueryContainer;
      },
    },
    // 搜索字段
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
    // 搜索展示字段
    {
      component: 'select-editor',
      name: 'searchResultFields',
      label: 'sys.pageDesigner.searchResultFields',
      group: PropGroup.SEARCH,
      required: true,
      changeCallback: async (widget) => {
        const data = (await getFieldMetaList({ modelKey: containerModelKey })) || [];
        widget.children = [];
        widget.children.push(...genComponentFields(data, widget.props.searchResultFields));
      },
      _config: {
        showSearch: true,
        multiple: true,
        tips: 'sys.pageDesigner.searchResultTips',
        options: async () => {
          const data = (await getFieldMetaList({ modelKey: containerModelKey })) || [];
          return data
            ?.filter((e) => resultFieldType.some((f) => f === e.type))
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        },
      },
      onMounted() {},
    },
    // 展示字段
    {
      component: 'select-editor',
      name: 'showResultFields',
      label: 'sys.kit.showResultFields',
      required: true,
      group: PropGroup.SEARCH,
      changeCallback: async (widget) => {
        const fieldData = (await getFieldMetaList({ modelKey: containerModelKey })) || [];
        const form = widget.props.form || createWidgetByType(FormComponents.Form);
        form.children = [];
        form.children.push(...genComponentFields(fieldData, widget.props.showResultFields));
        form.props.model = widget.props.model;
        widget.props.form = form;
      },
      _config: {
        showSearch: true,
        multiple: true,
        tips: 'sys.kit.showResultTips',
        options: async () => {
          const data = (await getFieldMetaList({ modelKey: containerModelKey })) || [];
          return data
            ?.filter((e) => resultFieldType.some((f) => f === e.type))
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
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    ...eventList,
    {
      name: 'afterSelect',
      title: 'sys.pageDesigner.afterSelect',
      params: ['data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...styleEditorList];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    // 初始化批次相关信息
    const fieldData = (await getFieldMetaList({ modelKey: containerModelKey })) || [];
    widget.children = [];
    const searchComList = genComponentFields(fieldData, widget.props.searchResultFields);
    widget.children.push(...searchComList);
    const showComList = genComponentFields(fieldData, widget.props.showResultFields);
    const form = createWidgetByType(FormComponents.Form);
    form.children = [];
    form.children.push(...showComList);
    form.props.model = widget.props.model;
    widget.props.form = form;
  };
}
