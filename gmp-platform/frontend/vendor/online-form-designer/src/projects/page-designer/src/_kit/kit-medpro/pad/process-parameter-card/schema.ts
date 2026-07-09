import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, StyleGroup } from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';

export interface ProcessParameterCardProps extends LowCodeWidget.WidgetProps {
  model: string;
}
interface IProcessParameterCard extends LowCodeWidget.BasicSchema {
  props: ProcessParameterCardProps;
}

export default class MedProProcessParameterCard implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];
  component: Component = defineAsyncComponent(
    () => import('./process-parameter-card-designer.vue'),
  );

  schema: IProcessParameterCard = {
    id: '',
    platform: Platform.PAD,
    name: 'sys.kit.processParamCard',
    alias: '',
    type: 'medpro' + KitType.PROCESS_PARAMETER_CARD,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      model: 'em_process_parameter_card',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [...(displayEditor as any)];

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

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: false,
  };
}
