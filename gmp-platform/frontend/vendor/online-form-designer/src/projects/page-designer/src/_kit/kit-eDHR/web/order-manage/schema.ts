import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
  FieldMetaDTO,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { ColumnTable } from '/@page-designer/types/web';
import { beginDrag } from '../../../../schema/utils';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';

const LOT_FIELDS = ['qty_'];

export interface OrderManageProps extends LowCodeWidget.WidgetProps {
  model: string;
  defaultModelKey?: string;
  importTemplateKey: string;
  exportTemplateKey: string;
  timeout?: number;
}
export interface IOrderManage extends LowCodeWidget.BasicSchema {
  props: OrderManageProps;
  children: [
    // 1. 查询字段列表
    ColumnTable[],
    // 2. 表格显示字段列表
    ColumnTable[],
    // 3. 创建字段列表
    ColumnTable[],
    // 4. 批次创建字段列表
    ColumnTable[],
    // 5. 自定义查询配置字段
    ColumnTable[],
    // 6. 模型全部字段
    ColumnTable[],
  ];
}

export function genComponentFields(
  fieldData: FieldMetaDTO[] = [],
  resultFields?: string[],
): ColumnTable[] {
  // 如果不指定字段，则默认生成所有字段映射组件
  if (!resultFields?.length) {
    resultFields = fieldData.map((e) => e.key as string);
  }
  const compList: Array<any> = [];
  resultFields?.forEach((e) => {
    const field: any = fieldData.find((f) => f.key === e) || {};
    const comp = beginDrag(field);
    compList.push(comp);
  });

  return compList ?? [];
}

export default class OrderManage implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./order-manage-designer.vue'));

  kit: string[] = [''];
  schema: IOrderManage = {
    id: '',
    platform: Platform.WEB,
    name: '工单管理',
    alias: '',
    type: KitType.ORDER_MANAGE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    props: {
      model: 'em_mfg_order',
      defaultModelKey: 'em_mfg_order',
      importTemplateKey: '',
      exportTemplateKey: '',
      timeout: 20,
      ...displayProps,
      ...baseBtnProp,
    },
    children: [[], [], [], [], [], []] as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'model-editor',
      name: 'model',
      label: 'sys.pageDesigner.model',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      async changeCallback(widget: IOrderManage) {
        const orderFieldsData =
          (await getFieldMetaList({ modelKey: widget.props.model ?? 'em_mfg_order' })) || [];
        widget.children![0].splice(0);
        widget.children![1].splice(0);
        widget.children![2].splice(0);
        widget.children![4].splice(0);
        widget.children![5] = genComponentFields(orderFieldsData);
      },
      _config: {
        category: 'entity,data,view',
      },
    },
    {
      component: 'select-editor',
      name: 'importTemplateKey',
      label: 'sys.pageDesigner.importTemplate',
      group: PropGroup.BUTTON,
      required: true,
      hidden: (widget) => !widget.props.model,
      _config: {
        options: async (widget) => {
          if (!widget.props.model) return [];
          const data =
            (await getExcelTmplList({ modelKey: widget.props.model, type: 'IMPORT' })) || [];
          return data
            .filter((e) => !!e.configJson)
            .map((i) => {
              return { value: i.key, label: i.name };
            });
        },
      },
    },
    {
      component: 'select-editor',
      name: 'exportTemplateKey',
      label: 'sys.pageDesigner.exportTemplate',
      group: PropGroup.BUTTON,
      required: true,
      hidden: (widget) => !widget.props.model,
      _config: {
        options: async (widget) => {
          if (!widget.props.model) return [];
          const data =
            (await getExcelTmplList({ modelKey: widget.props.model, type: 'EXPORT' })) || [];
          return data
            .filter((e) => !!e.configJson)
            .map((i) => {
              return { value: i.key, label: i.name };
            });
        },
      },
    },
    // 查询字段列表
    {
      component: 'table-field-list-editor',
      name: 'root:children.0',
      label: '查询字段',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: IOrderManage) => {
          const fieldWidget = beginDrag(item, {
            preLocation: widget.id,
          });
          return fieldWidget;
        },
      },
    },
    // 表格展示字段
    {
      component: 'table-field-list-editor',
      name: 'root:children.1',
      label: '表格展示字段',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: IOrderManage) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
        },
      },
    },
    // 创建使用字段
    {
      component: 'table-field-list-editor',
      name: 'root:children.2',
      label: '创建使用字段',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: IOrderManage) => {
          const fieldWidget = beginDrag(item, {
            preLocation: widget.id,
          });
          return fieldWidget;
        },
      },
    },
    // 自定义查询配置字段
    {
      component: 'table-field-list-editor',
      name: 'root:children.4',
      label: '自定义查询配置字段',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: IOrderManage) => {
          const fieldWidget = beginDrag(item);
          fieldWidget.props.readonly = false;
          return fieldWidget;
        },
      },
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
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
  ];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    const lotData = (await getFieldMetaList({ modelKey: 'em_txn_container_start' })) || [];
    const lotFieldsData = lotData?.filter((e) => LOT_FIELDS.includes(e.key as string));
    widget.children[3] = genComponentFields(lotFieldsData, LOT_FIELDS);
    const orderFieldsData =
      (await getFieldMetaList({ modelKey: widget.props.model || 'em_mfg_order' })) || [];
    widget.children[5] = genComponentFields(orderFieldsData);
  };
}
