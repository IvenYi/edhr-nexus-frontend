import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform } from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';

import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export type EdhrViewProps = LowCodeWidget.WidgetProps;
export interface IEdhrView extends LowCodeWidget.BasicSchema {
  props: EdhrViewProps;
}

export class EdhrView implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./edhr-view-designer.vue'));
  kit: string[] = ['MEDPROOLD'];
  schema: IEdhrView = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.edhrView',
    alias: '',
    type: KitType.EDHR_VIEW,
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
