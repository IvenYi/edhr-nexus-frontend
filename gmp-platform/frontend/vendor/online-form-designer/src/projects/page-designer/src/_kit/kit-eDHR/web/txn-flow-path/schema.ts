import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, StyleGroup } from '@gct/runtime';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export type ITxnFlowPath = LowCodeWidget.BasicSchema;

export default class TxnFlowPath implements IDesignerProvider {
  kit: string[] = ['eDHR'];

  component: Component = defineAsyncComponent(() => import('./txn-flow-path-designer.vue'));

  schema: ITxnFlowPath = {
    id: '',
    platform: Platform.WEB,
    name: '事务流程路径',
    alias: '',
    type: KitType.TXN_FLOW_PATH,
    display: DisplayEnums.BLOCK,
    displayName: '事务流程路径',
    icon: 'icon-fuzhibanben',
    props: {} as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [...(displayEditor as any)];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onNodePopoverClick',
      title: 'sys.pageDesigner.onNodePopoverClick',
      params: ['data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
    // {
    //   component: 'number-editor',
    //   name: 'width',
    //   label: 'sys.width',
    //   group: StyleGroup.LAYOUT,
    // },
    // {
    //   component: 'number-editor',
    //   name: 'height',
    //   label: 'sys.height',
    //   group: StyleGroup.LAYOUT,
    // },
  ];
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
