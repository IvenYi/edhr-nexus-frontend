import {
  DisplayEnums,
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
import { createWidgetByType } from '/@page-designer/schema/utils';
// import { getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';

export interface TxnSplitTableProps extends LowCodeWidget.WidgetProps {
  title: string;
  bindModelKey?: string;
  splitType: 'sn' | 'container';
  refTxnForm: string;
  templateKey?: string;
}
export interface ITxnSplitTable extends LowCodeWidget.BasicSchema {
  props: TxnSplitTableProps;
}

export default class TxnSplitTable implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./txn-split-table-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: ITxnSplitTable = {
    id: '',
    platform: Platform.WEB,
    name: '生产拆分表格',
    alias: '',
    type: KitType.TXN_SPLIT_TABLE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      title: '生产拆分表格',
      bindModelKey: '',
      splitType: 'container',
      refTxnForm: '',
      templateKey: '',
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
      name: 'splitType',
      label: '拆分方式',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        options: [
          { label: '按SN拆分', value: 'sn' },
          { label: '按批次拆分', value: 'container' },
        ],
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refTxnForm',
      label: '关联拆分主体表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
    },
    // {
    //   component: 'select-editor',
    //   name: 'templateKey',
    //   label: 'sys.pageDesigner.importTemplate',
    //   group: PropGroup.BUTTON,
    //   hidden: (widget) => !widget.props.bindModelKey,
    //   _config: {
    //     options: async (widget) => {
    //       if (!widget.props.bindModelKey) return [];
    //       const data =
    //         (await getExcelTmplList({ modelKey: widget.props.bindModelKey, type: 'IMPORT' })) || [];
    //       return data
    //         .filter((e) => !!e.configJson)
    //         .map((i) => {
    //           return { value: i.key, label: i.name };
    //         });
    //     },
    //   },
    // },
    ...displayEditor,
  ];

  beforeCreate?: Function | undefined = (widget) => {
    const dataTable = createWidgetByType(FormComponents.DataTable);
    widget.children = [dataTable];
    widget.props.bindModelKey = dataTable.props.model;
  };

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onMounted',
      title: 'sys.pageDesigner.onMounted',
      params: [],
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
