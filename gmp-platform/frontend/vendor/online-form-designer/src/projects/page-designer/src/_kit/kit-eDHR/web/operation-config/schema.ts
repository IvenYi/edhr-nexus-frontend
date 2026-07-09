import {
  DisplayEnums,
  FIELD_TYPE,
  FormComponents,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { createFieldWidgetByType, createWidgetByType } from '/@page-designer/schema/utils';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

export interface OperationConfigProps extends LowCodeWidget.WidgetProps {
  title: string;
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  /** 关联主体表单 */
  refTxnForm?: string;
  refTxnFormModel?: string;
  /** 关联工艺路线表单 */
  refRoutingForm: string;
  /** 关联工艺路线节点字段 */
  refRoutingOperationField: string;
  /** 关联表单绑定模型 */
  refFormModel?: string;
  bindModelKey?: string;
  workflowWidget?: any;
  bindWorkflowKey?: string | null;
  stepSettings: string[];
  snSplitEnabled?: boolean;
  finalOutputEnabled?: boolean;
  readonlyEnabled?: boolean;
  initializeLoad?: boolean;
  customDataSource?: boolean;
  datasourceConfig: any;
}
export interface IOperationConfig extends LowCodeWidget.BasicSchema {
  props: OperationConfigProps;
}

export default class OperationConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./operation-config-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: IOperationConfig = {
    id: '',
    platform: Platform.WEB,
    name: '工序配置',
    alias: '',
    type: KitType.OPERATION_CONFIG,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-xitongpeizhi1',
    props: {
      title: '工序配置',
      direction: 'vertical',
      size: 'small',
      refRoutingForm: '',
      refRoutingOperationField: '',
      refFormModel: '',
      refTxnForm: '',
      refTxnFormModel: '',
      bindModelKey: '',
      workflowWidget: null,
      bindWorkflowKey: null,
      stepSettings: [],
      snSplitEnabled: true,
      finalOutputEnabled: false,
      readonlyEnabled: false,
      initializeLoad: true,
      customDataSource: false,
      datasourceConfig: null,
      ...displayProps,
    },
    children: [],
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.SHOW,
    },
    {
      component: 'select-editor',
      name: 'stepSettings',
      label: '触发配置',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        showSearch: true,
        multiple: true,
        options: async () => {
          const data = (await getFieldMetaList({ modelKey: 'em_routing_operation_config' })) || [];
          return data
            ?.filter((e) => e.type === FIELD_TYPE.MASTERSLAVE)
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        },
      },
      changeCallback: (widget, value) => {
        /**
         * !hack: 新增的事务校验配置和前置执行配置的表格组件在初始化时未生成，通过此处change事件去生成表格组件
         * @date {2026-04-14}
         */
        const children = widget.children;
        if (children.length < value.length) {
          for (let i = children.length; i < value.length; i++) {
            const subTable = createWidgetByType(FormComponents.DataTable);
            children.push(subTable);
          }
        }
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refTxnForm',
      label: '关联工序配置表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
      changeCallback(widget) {
        console.log(widget, 'changeCallback');
        widget.props.refTxnField = '';
        widget.props.refOperationField = '';
        widget.props.refTxnFormModel = widget.props?.bindModelKey;
      },
    },
    {
      component: 'field-editor',
      name: 'refTxnField',
      label: '关联工序表单查询字段',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
      _config: {
        multiple: true,
        tips: '选择关联工序配置表单对应模型的查询字段，获取当前工序配置信息',
        modelKey: 'refTxnFormModel',
      },
      hidden: (widget) => !widget.props.refTxnForm,
    },
    {
      component: 'ref-form-editor',
      name: 'refRoutingForm',
      label: '关联工艺路线表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
      _config: {
        tips: '选择含有工艺路线节点的表单',
      },
      changeCallback: (widget: IOperationConfig) => {
        widget.props.refRoutingOperationField = '';
        const bindModelKey = widget.props?.bindModelKey;
        widget.props.refFormModel = bindModelKey;
        widget.props.bindWorkflowKey = null;
      },
      hidden: (widget) => widget.props.bindWorkflowKey,
    },
    {
      component: 'field-editor',
      name: 'refRoutingOperationField',
      label: '关联工艺路线节点字段',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
      _config: {
        tips: '选择关联工艺路线表单对应模型的工艺路线节点字段',
        modelKey: 'refFormModel',
      },
      hidden: (widget) => !widget.props.refRoutingForm,
      changeCallback: async (widget) => {
        const workflowNode = createFieldWidgetByType(FormComponents.WorkflowNodes);
        widget.props.workflowWidget = workflowNode;
      },
    },
    {
      component: 'select-editor',
      name: 'bindWorkflowKey',
      label: '关联工艺路线',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
      _config: {
        tips: '选择页面中已创建的工艺路线',
        options: () => {
          const { allWidget } = useDesigner();
          const widgets = allWidget.value.filter(
            (item) => item.type === FormComponents.WorkflowNodes,
          );
          return widgets.map((it) => {
            return {
              label: it.props.title || it.props.fieldName || it.alias,
              value: it.id,
            };
          });
        },
      },
      hidden: (widget) => widget.props.refRoutingForm,
      changeCallback: async (widget) => {
        widget.props.workflowWidget = null;
        widget.props.refRoutingForm = '';
        widget.props.refRoutingOperationField = '';
      },
    },
    {
      label: '启用SN拆分',
      name: 'snSplitEnabled',
      component: 'switch-editor',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
    },
    {
      label: '启用最终产出工序',
      name: 'finalOutputEnabled',
      component: 'switch-editor',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
    },
    {
      label: '是否展示为详情态',
      name: 'readonlyEnabled',
      component: 'switch-editor',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
    },
    {
      label: '数据初始化加载',
      name: 'initializeLoad',
      component: 'switch-editor',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
    },
    {
      component: 'switch-editor',
      name: 'customDataSource',
      label: 'sys.pageDesigner.customDataSource',
      group: PropGroup.BUSINESS_CONFIG,
      hidden: (widget) => {
        return !widget.props.initializeLoad;
      },
    },
    {
      component: 'data-sourse-editor',
      name: 'datasourceConfig',
      label: '',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget) {
        return !widget.props.customDataSource;
      },
    },
    ...displayEditor,
  ];

  beforeCreate?: Function | undefined = (widget) => {
    const formSubTable = createWidgetByType(FormComponents.DataTable);
    const sopSubTable = createWidgetByType(FormComponents.DataTable);
    const txnSubTable = createWidgetByType(FormComponents.DataTable);
    widget.children = [formSubTable, sopSubTable, txnSubTable];
  };

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['operation', 'formData'],
    },
    {
      name: 'onSelected',
      title: '节点选择后',
      params: ['operation', 'formData'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
