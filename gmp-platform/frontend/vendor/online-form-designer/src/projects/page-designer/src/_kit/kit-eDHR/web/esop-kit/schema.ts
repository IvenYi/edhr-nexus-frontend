import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  sortTypeEnum,
} from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType, E_TXN_MODULE, E_EXECUTE_TYPE, E_PRODUCT_MODALITY } from '../../../enums';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

export interface ESopKitProps extends LowCodeWidget.WidgetProps {
  /** 关联表单 */
  model: string;
  modelKey: string;
  batchRefForm?: string;
  batchFormModelKey?: string;
  refContainerField: string;
  refOperationField: string;
  noNeedAutoQuery: boolean;
  openNew: boolean;
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  txnModule: E_TXN_MODULE;
  businessType?: E_EXECUTE_TYPE;
  productionType?: E_PRODUCT_MODALITY;
  customdataSource: boolean;
  datasourceConfig: any;
}

export interface IESopKit extends LowCodeWidget.BasicSchema {
  props: ESopKitProps;
}

export default class ESopKitPluginConfig implements IDesignerProvider {
  kit: string[] = ['eDHR'];

  component: Component = defineAsyncComponent(() => import('./esop-kit-designer.vue'));

  schema: IESopKit = {
    id: '',
    platform: Platform.WEB,
    name: 'esop',
    alias: '',
    type: KitType.ESOP_KIT,
    display: DisplayEnums.BLOCK,
    displayName: 'ESOP',
    icon: 'icon-fuzhibanben',
    props: {
      model: 'em_routing_operation_config',
      modelKey: 'em_routing_operation_config',
      batchRefForm: undefined,
      batchFormModelKey: undefined,
      noNeedAutoQuery: false,
      openNew: false,
      txnModule: E_TXN_MODULE.PRODUCTION,
      businessType: undefined,
      productionType: undefined,
      collation: [
        {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ],
      customdataSource: false,
      datasourceConfig: null,
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'select-editor',
      name: 'txnModule',
      label: '事务模块',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        options: [
          {
            label: '生产',
            value: E_TXN_MODULE.PRODUCTION,
          },
          {
            label: '检验',
            value: E_TXN_MODULE.INSPECTION,
          },
          {
            label: '放行',
            value: E_TXN_MODULE.RELEASE,
          },
        ],
      },
    },

    {
      component: 'ref-form-editor',
      name: 'batchRefForm',
      label: '_kit.pageDesigner.txnDataCollection.batchRefForm',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '选择批次表单，批次表单中会有批次、工序字段',
        bindModelKey: 'batchFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.refContainerField = undefined;
        widget.props.refOperationField = undefined;
      },
      onMounted(widget: IESopKit) {
        if (!widget.props?.batchRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.batchRefForm,
        );
        if (!formWidget) {
          widget.props.batchRefForm = undefined;
        }
      },
      hidden: (widget: IESopKit) => {
        return widget.props.txnModule !== E_TXN_MODULE.PRODUCTION;
      },
    },

    {
      component: 'select-editor',
      name: 'businessType',
      label: '业务类型',
      _config: {
        showSearch: true,
        options() {
          return [
            {
              label: '生产作业',
              value: E_EXECUTE_TYPE.PRODUCTION,
            },
            {
              label: '返工作业',
              value: E_EXECUTE_TYPE.REWORK,
            },
          ];
        },
      },
      group: PropGroup.BUSINESS_CONFIG,
      hidden: (widget: IESopKit) => {
        return widget.props.txnModule !== E_TXN_MODULE.PRODUCTION || !widget.props.batchRefForm;
      },
    },

    {
      component: 'select-editor',
      name: 'productionType',
      label: '生产形态',
      _config: {
        showSearch: true,
        options() {
          return [
            {
              label: 'SN',
              value: E_PRODUCT_MODALITY.SN,
            },
            {
              label: '批次',
              value: E_PRODUCT_MODALITY.CONTAINER,
            },
          ];
        },
      },
      group: PropGroup.BUSINESS_CONFIG,
      hidden: (widget: IESopKit) => {
        return widget.props.txnModule !== E_TXN_MODULE.PRODUCTION || !widget.props.batchRefForm;
      },
    },

    {
      component: 'select-editor',
      name: 'refContainerField',
      label: '关联批次/SN字段',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次表单对应模型的批次/SN字段',
        options: async (widget) => {
          const data = (await getFieldMetaList({ modelKey: widget.props.batchFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget: IESopKit) => {
        return widget.props.txnModule !== E_TXN_MODULE.PRODUCTION || !widget.props.batchRefForm;
      },
    },

    {
      component: 'select-editor',
      name: 'refOperationField',
      label: '关联工序字段',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次表单对应模型的工序字段',
        options: async (widget) => {
          const data = (await getFieldMetaList({ modelKey: widget.props.batchFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget: IESopKit) => {
        return widget.props.txnModule !== E_TXN_MODULE.PRODUCTION || !widget.props.batchRefForm;
      },
    },

    {
      component: 'switch-editor',
      name: 'customdataSource',
      label: 'sys.pageDesigner.customDataSource',
      group: PropGroup.BUSINESS_CONFIG,
      hidden: (widget) => widget.props.bindFieldKey || widget.props.fieldReadonly,
    },
    {
      component: 'data-sourse-editor',
      name: 'datasourceConfig',
      label: '',
      group: PropGroup.BUSINESS_CONFIG,
      hidden(widget) {
        return !widget.props.customdataSource;
      },
    },

    {
      component: 'sorts-editor',
      label: '',
      name: 'collation',
      group: PropGroup.LISTDATA,
      _config: {
        label: '排序字段',
        getModelKey: (widget: IESopKit) => {
          return widget.props.model;
        },
      },
      hidden(widget: IESopKit) {
        return !widget.props.model;
      },
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      label: 'sys.pageDesigner.maximumHeight',
      group: StyleGroup.LAYOUT,
      name: 'maxHeight',
      _config: {
        // @ts-ignore
        min: 200,
      },
    },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
