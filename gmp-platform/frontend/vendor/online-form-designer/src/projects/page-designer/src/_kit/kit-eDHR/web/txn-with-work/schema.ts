import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType, E_TXN_MODULE } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { E_BUSINESS_TYPE, E_BELONG_TYPE } from './types';

export interface TxnWithWorkProps extends LowCodeWidget.WidgetProps {
  title: string;
  showAction: boolean;
  autoQuery?: boolean;
  /** 关联批次/SN表单 */
  lotRefForm: string;
  batchLotFormModelKey?: string;
  lotField: string;
  operationField: string;
  txnModule: E_TXN_MODULE;
  businessType?: E_BUSINESS_TYPE;
  belongType?: E_BELONG_TYPE;
  materialNoField: string;
  prodMaterialNoField: string;
  mfgOrderId: string;
  isViewPage?: boolean;
  formInstBtnPerKey?: string;
  appendixBtnPerKey?: string;
  customdataSource: boolean;
  datasourceConfig: any;
}
export interface ITxnWithWork extends LowCodeWidget.BasicSchema {
  props: TxnWithWorkProps;
}

export default class TxnWithWork implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./txn-with-work-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: ITxnWithWork = {
    id: '',
    platform: Platform.WEB,
    name: '表单执行',
    alias: '',
    type: KitType.TXN_WITH_WORK,
    display: DisplayEnums.BLOCK,
    icon: 'icon-biaodan',
    props: {
      title: '待填报表单',
      lotRefForm: '',
      lotField: '',
      operationField: '',
      showAction: true,
      autoQuery: true,
      txnModule: E_TXN_MODULE.PRODUCTION,
      businessType: undefined,
      belongType: undefined,
      isViewPage: false,
      customdataSource: false,
      datasourceConfig: null,
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
    i18n: {},
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.SHOW,
      _config: {
        i18n: true,
      },
    },
    {
      component: 'switch-editor',
      name: 'autoQuery',
      label: '在线表单自动查询',
      group: PropGroup.BUSINESS_CONFIG,
    },
    {
      component: 'switch-editor',
      name: 'isViewPage',
      label: '仅展示',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        tips: '表单仅展示，不可填报',
      },
    },
    {
      component: 'ref-form-editor',
      name: 'lotRefForm',
      label: '批次/SN（执行）表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        bindModelKey: 'batchLotFormModelKey',
      },
      onMounted(widget: ITxnWithWork) {
        if (!widget.props?.lotRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.lotRefForm,
        );
        if (!formWidget) {
          widget.props.lotRefForm = '';
        }
      },
    },

    {
      component: 'select-editor',
      name: 'txnModule',
      label: '事务模块',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
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
      component: 'select-editor',
      name: 'belongType',
      label: '执行类型',
      _config: {
        showSearch: true,
        options() {
          return [
            {
              label: '批次',
              value: E_BELONG_TYPE.LOT,
            },
            {
              label: 'SN',
              value: E_BELONG_TYPE.SN,
            },
          ];
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
      group: PropGroup.BUSINESS_CONFIG,
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
              value: E_BUSINESS_TYPE.PRODUCTION,
            },
            {
              label: '返工作业',
              value: E_BUSINESS_TYPE.REWORK,
            },
            {
              label: '检验作业',
              value: E_BUSINESS_TYPE.INSPECTION,
            },
          ];
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
      group: PropGroup.BUSINESS_CONFIG,
    },
    {
      component: 'select-editor',
      name: 'lotField',
      label: '批次/SN字段',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次/SN（执行）表单对应的批次字段',
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.batchLotFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
    },
    {
      component: 'select-editor',
      name: 'materialNoField',
      label: '批次号字段',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次/SN（执行）表单对应的批次/sn字段',
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.batchLotFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
    },

    {
      component: 'select-editor',
      name: 'prodMaterialNoField',
      label: '生产批次号字段',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次/SN（执行）表单对应的生产批次/sn字段',
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.batchLotFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
    },

    {
      component: 'select-editor',
      name: 'operationField',
      label: '工序/检验类型/放行类型字段',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次/SN（执行）表单对应的工序/检验类型/放行类型字段',
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.batchLotFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
    },

    {
      component: 'select-editor',
      name: 'mfgOrderId',
      label: '工单字段',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        showSearch: true,
        tips: '选择批次/SN（执行）表单对应的工单字段',
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.batchLotFormModelKey })) || [];
          return data.map((e) => {
            return {
              ...e,
              label: e.name,
              value: e.key,
            };
          });
        },
      },
      hidden: (widget) => {
        return !widget.props.lotRefForm;
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
      component: 'text-editor',
      name: 'formInstBtnPerKey',
      label: '添加表单实例的按钮权限Key',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
    },

    {
      component: 'text-editor',
      name: 'appendixBtnPerKey',
      label: '添加附录表的按钮权限Key',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
      hidden: (widget) => {
        return !widget.props.lotRefForm;
      },
    },
    ...displayEditor,
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeClick',
      title: 'sys.pageDesigner.beforeClick',
      params: ['value', 'data', 'formData'],
    },
    {
      name: 'afterClick',
      title: 'sys.pageDesigner.afterClick',
      params: [],
    },
    {
      name: 'onMounted',
      title: 'sys.pageDesigner.onMounted',
      params: [],
    },
    {
      name: 'getSopList',
      title: 'sys.edhr.getSopList',
      params: [],
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
}
