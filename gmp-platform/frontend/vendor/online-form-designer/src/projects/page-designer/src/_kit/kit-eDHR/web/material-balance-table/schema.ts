import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, StyleGroup } from '@gct/runtime';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export interface IMaterialBalanceTable extends LowCodeWidget.BasicSchema {
  children: [any, any, any];
}

export default class MaterialBalanceTable implements IDesignerProvider {
  kit: string[] = ['eDHR'];

  component: Component = defineAsyncComponent(
    () => import('./material-balance-table-designer.vue'),
  );

  schema: IMaterialBalanceTable = {
    id: '',
    platform: Platform.WEB,
    name: '物料平衡表',
    alias: '',
    type: KitType.MATERIAL_BALANCE_TABLE,
    display: DisplayEnums.BLOCK,
    displayName: '物料平衡表',
    icon: 'icon-RDOliebiao',
    children: [{}, {}, {}],
    props: {
      model: undefined,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [...(displayEditor as any)];

  events: LowCodeWidget.EventsType[] = [];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
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
  ];
  designerConfig: LowCodeWidget.DesignerConfig = {
    // hideMask: true,
  };
  beforeCreate: LowCodeWidget.beforeCreate = () => {};
}
