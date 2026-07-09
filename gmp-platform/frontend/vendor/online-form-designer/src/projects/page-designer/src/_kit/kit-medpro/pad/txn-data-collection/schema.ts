import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  FormComponents,
  StyleGroup,
  PropGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { createFieldWidgetByType } from '/@page-designer/schema/utils';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';

export interface TxnDataCollectionProps extends LowCodeWidget.WidgetProps {
  readonly: boolean;
  model: string;
  widgetsMap: object;
}
export interface ITxnDataCollection extends LowCodeWidget.BasicSchema {
  props: TxnDataCollectionProps;
}

export default class MedProTxnDataCollection implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./txn-data-collection-designer.vue'));
  kit: string[] = ['MEDPRO'];
  schema: ITxnDataCollection = {
    id: '',
    platform: Platform.PAD,
    name: 'sys.kit.txnDataCollect',
    alias: '',
    type: 'medpro' + KitType.TXN_DATA_COLLECTION,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      readonly: false, // 是否只读
      model: 'em_data_collection',
      widgetsMap: {},
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'checkbox-editor',
      name: 'readonly',
      label: '',
      group: PropGroup.FIELD_CONFIG,
    },
    ...(displayEditor as any),
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
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

  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onLoaded',
      title: '_kit.pageDesigner.txnDataCollection.onLoaded',
      params: ['data', 'status'],
    },
    {
      name: 'afterClosed',
      title: '_kit.pageDesigner.txnDataCollection.afterClosed',
      params: [],
    },
  ];

  designerConfig: LowCodeWidget.DesignerConfig = {};

  beforeCreate?: LowCodeWidget.beforeCreate = async (node: ITxnDataCollection) => {
    const widgetsMap = [
      FormComponents.Radio,
      FormComponents.Inputnumber,
      FormComponents.Input,
      FormComponents.UploadImage,
      FormComponents.Userpicker,
      FormComponents.Department,
      FormComponents.Datepicker,
      FormComponents.DateTimepicker,
      FormComponents.Select,
      FormComponents.Switch,
      FormComponents.UploadFile,
    ];

    widgetsMap.forEach((item) => {
      node.props.widgetsMap[item] = createFieldWidgetByType(item);
    });
  };
}
