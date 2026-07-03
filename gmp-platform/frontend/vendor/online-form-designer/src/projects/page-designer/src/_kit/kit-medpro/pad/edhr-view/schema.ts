import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform } from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';

export type EdhrViewProps = LowCodeWidget.WidgetProps;
export interface IEdhrView extends LowCodeWidget.BasicSchema {
  props: EdhrViewProps;
}

export default class MedProEdhrView implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./edhr-view-designer.vue'));

  schema: IEdhrView = {
    id: '',
    platform: Platform.PAD,
    name: 'sys.kit.edhrView',
    alias: '',
    type: 'medpro' + KitType.EDHR_VIEW,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    props: {
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [...displayEditor];
}
