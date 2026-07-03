import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { E_TXN_MODULE, KitType, E_EXECUTE_TYPE, E_PRODUCT_MODALITY } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

export interface TxnButtonsGroupProps extends LowCodeWidget.WidgetProps {
  title: string;
  txnModule?: E_TXN_MODULE;
  productModality?: E_PRODUCT_MODALITY;
  executeType?: E_EXECUTE_TYPE;
  refSearchForm: string;
  refSearchField: string[];
  disabled: boolean;
}
export interface ITxnButtonsGroup extends LowCodeWidget.BasicSchema {
  props: TxnButtonsGroupProps;
}

export default class TxnButtonsGroup implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./txn-buttons-group-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: ITxnButtonsGroup = {
    id: '',
    platform: Platform.WEB,
    name: '事务按钮组',
    alias: '',
    type: KitType.TXN_BUTTONS_GROUP,
    display: DisplayEnums.BLOCK,
    icon: 'icon-anniuzu',
    props: {
      title: '事务按钮组',
      txnModule: E_TXN_MODULE.PRODUCTION,
      refSearchForm: '',
      refSearchField: [],
      executeType: E_EXECUTE_TYPE.PRODUCTION,
      productModality: E_PRODUCT_MODALITY.CONTAINER,
      disabled: false,
      ...displayProps,
    },
    children: [],
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
    },

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
      component: 'select-editor',
      name: 'productModality',
      label: '生产形态',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        options: [
          {
            label: '批次',
            value: 'container',
          },
          {
            label: 'SN',
            value: 'sn',
          },
        ],
      },
      hidden: (widget) => widget.props.txnModule !== 'PRODUCTION',
    },

    {
      component: 'ref-form-editor',
      name: 'refSearchForm',
      label: '关联查询表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '选择数据查询关联表单，表单中会有产品等字段',
        bindModelKey: 'batchFormModelKey',
      },
    },

    {
      component: 'select-editor',
      name: 'refSearchField',
      label: 'sys.pageDesigner.associatedFields',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        multiple: true,
        showSearch: true,
        tips: '选择查询表单中对应模型的产品（第一个）字段，工序或检验类型、放行类型（第二个）字段，批次id或SN id（第三个）字段',
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
      hidden: (widget) => !widget.props.refSearchForm,
    },

    {
      component: 'switch-editor',
      name: 'disabled',
      label: '仅展示',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        tips: '禁用按钮组不可点击',
      },
    },

    ...displayEditor,
  ];

  beforeCreate?: Function | undefined = () => {};

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeClick',
      title: 'sys.pageDesigner.beforeClick',
      params: ['postData', 'rowData'],
    },
    {
      name: 'afterClick',
      title: 'sys.pageDesigner.afterClick',
      params: ['result', 'rowData'],
    },
    {
      name: 'beforeSearch',
      title: 'sys.pageDesigner.beforeSearch',
      params: ['queryParam'],
    },
    {
      name: 'afterSearch',
      title: 'sys.pageDesigner.afterSearch',
      params: ['result'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
    {
      component: 'font-editor',
      name: 'labelFont',
      label: 'sys.name',
      group: StyleGroup.STYLE,
    },
    {
      component: 'font-editor',
      name: 'contentFont',
      label: 'sys.content',
      group: StyleGroup.STYLE,
    },
    {
      component: 'color-editor',
      name: 'backgroundColor',
      label: 'sys.pageDesigner.backgroundColor',
      group: StyleGroup.BACKGROUND,
    },
  ];

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
