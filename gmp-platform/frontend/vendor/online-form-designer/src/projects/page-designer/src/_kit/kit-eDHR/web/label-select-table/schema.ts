import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  FormComponents,
} from '@gct/runtime';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export type ILabelSelectTable = LowCodeWidget.BasicSchema;

export default class LabelSelectTable implements IDesignerProvider {
  kit: string[] = ['eDHR'];

  component: Component = defineAsyncComponent(() => import('./label-select-table-designer.vue'));

  schema: ILabelSelectTable = {
    id: '',
    platform: Platform.WEB,
    name: '标签选择表',
    alias: '',
    type: KitType.LABEL_SELECT_TABLE,
    display: DisplayEnums.BLOCK,
    displayName: '标签选择表',
    icon: 'icon-RDOliebiao',
    props: {
      // model: undefined,
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
}
