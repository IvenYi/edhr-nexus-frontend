import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  StyleGroup,
  PropGroup,
  FormComponents,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { createFieldWidgetByType } from '/@page-designer/schema/utils';

export interface DynamicDataTableProps extends LowCodeWidget.WidgetProps {
  widgetsMap: object;
}
interface IDynamicDataTable extends LowCodeWidget.BasicSchema {
  props: DynamicDataTableProps;
}

export default class MedProDynamicDataTable implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./dynamic-data-table-designer.vue'));
  kit: string[] = ['MEDPRO'];
  schema: IDynamicDataTable = {
    id: '',
    children: [],
    platform: Platform.PAD,
    name: 'sys.kit.dynamicDataTable',
    alias: '',
    type: 'medpro' + KitType.DYNAMIC_DATA_TABLE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      widgetsMap: {},
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [...(displayEditor as any)];

  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onLoaded',
      title: '_kit.pageDesigner.txnDataCollection.onLoaded',
      params: ['data', 'status'],
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
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: false,
  };

  beforeCreate?: LowCodeWidget.beforeCreate = async (node) => {
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
    console.log('widgetsMap', widgetsMap);
    widgetsMap.forEach((item) => {
      node.props.widgetsMap[item] = createFieldWidgetByType(item);
    });
  };
}
