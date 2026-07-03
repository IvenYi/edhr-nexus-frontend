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
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';

export interface DynamicDataTableProps extends LowCodeWidget.WidgetProps {
  readonly: boolean;
  customTableHeader?: boolean;
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
    platform: Platform.WEB,
    name: 'sys.kit.dynamicDataTable',
    alias: '',
    type: 'medpro' + KitType.DYNAMIC_DATA_TABLE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      readonly: false,
      customTableHeader: false,
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly']),
    {
      component: 'checkbox-editor',
      name: 'customTableHeader',
      label: '',
      group: PropGroup.FIELD_CONFIG,
    },
    {
      component: 'button-container-editor',
      name: '',
      label: 'sys.pageDesigner.buttonZone',
      group: PropGroup.BUTTON,
      _config: {
        options: [FormComponents.CustomButton] as any,
      },
    },
    ...(displayEditor as any),
  ];

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
    hideMask: true,
  };
}
