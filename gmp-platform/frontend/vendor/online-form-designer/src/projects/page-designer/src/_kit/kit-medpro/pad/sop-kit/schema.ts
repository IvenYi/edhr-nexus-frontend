import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export interface SopKitProps extends LowCodeWidget.WidgetProps {
  model: string;
  modelKey: string;
  openNew: boolean;
}

export interface ISopKit extends LowCodeWidget.BasicSchema {
  props: SopKitProps;
}

export default class MedProSopKitPluginConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./sop-kit-designer.vue'));

  schema: ISopKit = {
    id: '',
    platform: Platform.PAD,
    name: 'sop',
    alias: '',
    type: 'medpro' + KitType.SOP_KIT,
    display: DisplayEnums.BLOCK,
    displayName: 'SOP',
    icon: 'icon-fuzhibanben',
    props: {
      model: 'em_sop_usage_rule',
      modelKey: 'em_sop_usage_rule',
      openNew: false,
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'switch-editor',
      name: 'openNew',
      label: 'sys.kit.openNew',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      label: 'sys.pageDesigner.maximumHeight',
      group: StyleGroup.LAYOUT,
      name: 'maxHeight',
      _config: {
        min: 200,
      },
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
