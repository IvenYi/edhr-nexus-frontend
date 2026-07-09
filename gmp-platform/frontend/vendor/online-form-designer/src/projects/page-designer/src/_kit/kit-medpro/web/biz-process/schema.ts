import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';

export interface BizProcessProps extends LowCodeWidget.WidgetProps {
  description: string;
}
export interface IBizProcess extends LowCodeWidget.BasicSchema {
  props: BizProcessProps;
}

export default class BizProcess implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./biz-process-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IBizProcess = {
    id: '',
    platform: Platform.WEB,
    name: '业务流',
    alias: '',
    type: 'medpro' + KitType.BIZ_PROCESS,
    display: DisplayEnums.BLOCK,
    icon: 'icon-yewuliu',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'root:name',
      label: 'sys.pageDesigner.widgetName',
      group: PropGroup.BASIC,
      _config: {
        showCount: true,
        maxlength: 32,
      },
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
}
