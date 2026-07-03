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

export interface FileCollectProps extends LowCodeWidget.WidgetProps {
  modelKey: string;
  openNew: boolean;
}

export interface IFileCollect extends LowCodeWidget.BasicSchema {
  props: FileCollectProps;
}

export default class MedProFileCollectPluginConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./file-collect-designer.vue'));

  schema: IFileCollect = {
    id: '',
    platform: Platform.PAD,
    name: 'sys.kit.fileCollect',
    alias: '',
    type: 'medpro' + KitType.FILE_COLLECT,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.fileCollect',
    icon: 'icon-fuzhibanben',
    props: {
      modelKey: 'em_document_set',
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
