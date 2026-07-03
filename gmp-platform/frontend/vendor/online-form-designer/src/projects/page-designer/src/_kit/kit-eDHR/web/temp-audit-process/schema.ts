import { Component, defineAsyncComponent } from 'vue';
import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import {
  displayProps,
  displayEditor,
} from '/@page-designer/schema/common-config/display-editor-config';
import { KitType } from '../../../enums';

export interface TaskManageProps extends LowCodeWidget.WidgetProps {
  model: string;
  defaultModelKey?: string;
}
export interface ITaskManage extends LowCodeWidget.BasicSchema {
  props: TaskManageProps;
  children: [];
}

export default class OrderManage implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./temp-audit-process-designer.vue'));

  kit: string[] = ['eDHR', 'MEDPRO'];
  schema: ITaskManage = {
    id: '',
    platform: Platform.WEB,
    name: '模板审核',
    alias: '',
    type: KitType.TEMP_AUDIT_PROCESS,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    props: {
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
      name: 'pageKey',
      label: '页面key',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
    },
    ...displayEditor,
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [];
  beforeCreate?: LowCodeWidget.beforeCreate = async () => {};
}
