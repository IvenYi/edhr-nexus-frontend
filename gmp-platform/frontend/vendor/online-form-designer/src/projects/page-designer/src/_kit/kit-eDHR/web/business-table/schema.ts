import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  FormComponents,
  FIELD_TYPE,
  CreateType,
  searchListByFieldType,
  TableSearchTypeEnum,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';
import {
  createdSearchField,
  createFieldWidgetByType,
  createWidgetByType,
} from '/@page-designer/schema/utils';
import { SearchWidgets, Search, DataTable, WorkflowNodes } from '/@page-designer/types/web';
import { getDataTableWidget } from './logic';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

export interface BusinessTableProps extends LowCodeWidget.WidgetProps {
  model: string;
  /** 工艺路线节点配置 */
  workFlowNodes: WorkflowNodes;
  /** 工序节点的字段集合 */
  routingOpCols: string[];
  /** 可以点击跳转的字段集合 */
  linkCols: string[];
  /** 工艺路线字段 */
  routingField?: string;
}
export interface IBusinessTable extends LowCodeWidget.BasicSchema {
  props: BusinessTableProps;
  children: [DataTable];
}

const FieldSelectProps = {
  component: 'select-editor',
  group: PropGroup.Table,
  _config: {
    multiple: true,
    options: (widget) => {
      const table = getDataTableWidget(widget);
      const allFields = table.children[1]?.children ?? [];
      return allFields.map((field) => {
        return {
          label: field.alias,
          value: field.id,
        };
      });
    },
  },
};

export default class BusinessTableManage implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./business-table-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: IBusinessTable = {
    id: '',
    platform: Platform.WEB,
    name: '业务表格',
    alias: '',
    type: KitType.BUSINESS_TABLE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    props: {
      model: '',
      routingOpCols: [],
      routingField: '',
      linkCols: [],
      ...displayProps,
    },
    children: [] as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      ...FieldSelectProps,
      name: 'routingOpCols',
      label: '工序节点列集合',
    },
    {
      name: 'routingField',
      label: '工艺路线字段',
      component: 'select-editor',
      group: PropGroup.Table,
      _config: {
        showSearch: true,
        options: async (widget) => {
          const modelKey = widget.children[0]?.props?.model;
          const allFields = (await getFieldMetaList({ modelKey })) ?? [];
          return allFields.map((field) => {
            return {
              label: field.name,
              value: field.key,
            };
          });
        },
      },
    },
    {
      ...FieldSelectProps,
      name: 'linkCols',
      label: '链接跳转列集合',
    },
  ];

  // 自定义事件
  events: LowCodeWidget.EventsType[] = [
    {
      name: 'linkColClick',
      title: '链接列点击事件',
      params: ['column', 'row', 'rowIndex'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    const table = createWidgetByType(FormComponents.DataTable);
    widget.children[0] = table;

    //初始化工序节点用到的工作流节点组件配置
    const workFlowNodes = createFieldWidgetByType(FormComponents.WorkflowNodes) as WorkflowNodes;
    workFlowNodes.props.readonly = true;
    workFlowNodes.props.bindModelKey = 'em_routing_operation';
    workFlowNodes.props.modelKey = 'em_routing';
    widget.props.workFlowNodes = workFlowNodes;
  };

  // 页面设计器配置
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
