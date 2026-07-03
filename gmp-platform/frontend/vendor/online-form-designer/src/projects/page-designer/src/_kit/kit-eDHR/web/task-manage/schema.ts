import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
  FieldMetaDTO,
  FormComponents,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';
import { ColumnTable } from '/@page-designer/types/web';
import { beginDrag, createFieldWidgetByType } from '../../../../schema/utils';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

export interface TaskManageProps extends LowCodeWidget.WidgetProps {
  model: string;
  defaultModelKey?: string;
}
export interface ITaskManage extends LowCodeWidget.BasicSchema {
  props: TaskManageProps;
  children: [
    // 1. 查询字段列表
    ColumnTable[],
    // 2. 表格字段列表
    ColumnTable[],
    // 3. 详情字段列表
    ColumnTable[],
    // 4. 工序（工作流）
    FormComponents.WorkflowNodes,
    // 5. 自定义查询配置字段
    ColumnTable[],
    // 6. 批次所有字段
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
  resultFields.forEach((e) => {
    const field: any = fieldData.find((f) => f.key === e) || {};
    const comp = beginDrag(field);
    compList.push(comp);
  });

  return compList ?? [];
}

export default class OrderManage implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./task-manage-designer.vue'));

  kit: string[] = [''];
  schema: ITaskManage = {
    id: '',
    platform: Platform.WEB,
    name: '任务管理',
    alias: '',
    type: KitType.TASK_MANAGE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    props: {
      model: 'em_container',
      defaultModelKey: 'em_container',
      ...displayProps,
    },
    children: [[], [], [], null, [], []] as any,
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
      async changeCallback(widget: ITaskManage) {
        const orderFieldsData =
          (await getFieldMetaList({ modelKey: widget.props.model ?? 'em_container' })) || [];
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
    // 查询字段列表
    {
      component: 'table-field-list-editor',
      name: 'root:children.0',
      label: '查询字段',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: ITaskManage) => {
          const fieldWidget = beginDrag(item, {
            preLocation: widget.id,
          });
          console.log('查询字段', fieldWidget);
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
        createField: (item, widget: ITaskManage) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.readonly = true;
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
        },
      },
    },
    // 详情展示字段
    {
      component: 'table-field-list-editor',
      name: 'root:children.2',
      label: '详情展示字段',
      group: PropGroup.BUSINESS_CONFIG,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: ITaskManage) => {
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
        createField: (item, widget: ITaskManage) => {
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
    const containerData =
      (await getFieldMetaList({ modelKey: widget.props.model || 'em_container' })) || [];
    widget.children[5] = genComponentFields(containerData);
    widget.children[3] = createFieldWidgetByType(FormComponents.WorkflowNodes);
    widget.children[3].props.readonly = true;
    widget.children[3].props.bindModelKey = 'em_routing_operation';
    widget.children[3].props.modelKey = 'em_routing';
  };
}
