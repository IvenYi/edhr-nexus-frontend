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

export interface EmptyProps extends LowCodeWidget.WidgetProps {
  description: string;
  subDescription?: string;
}
export interface IEmpty extends LowCodeWidget.BasicSchema {
  props: EmptyProps;
}

export default class Empty implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./empty-designer.vue'));

  kit: string[] = ['MEDPRO', 'eDHR'];
  schema: IEmpty = {
    id: '',
    platform: Platform.WEB,
    name: '空状态',
    alias: '',
    type: 'medpro' + KitType.EMPTY,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      ...displayProps,
      description: '暂无数据',
      subDescription: '',
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
    {
      component: 'text-editor',
      name: 'description',
      label: '自定义描述内容',
      group: PropGroup.BASIC,
      _config: {
        showCount: true,
        i18n: true,
      },
    },
    {
      component: 'text-editor',
      name: 'subDescription',
      label: '自定义次级描述内容',
      group: PropGroup.BASIC,
      _config: {
        showCount: true,
        i18n: true,
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
