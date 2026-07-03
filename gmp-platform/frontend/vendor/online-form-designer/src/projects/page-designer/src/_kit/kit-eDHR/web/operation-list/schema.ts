import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';

export interface OperationListProps extends LowCodeWidget.WidgetProps {
  title: string;
  autoQuery?: boolean;
  enableHighlight?: boolean;
}
export interface IOperationList extends LowCodeWidget.BasicSchema {
  props: OperationListProps;
}

export default class OperationList implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./operation-lis-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: IOperationList = {
    id: '',
    platform: Platform.WEB,
    name: '工序列表',
    alias: '',
    type: KitType.OPERATION_LIST,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiao',
    props: {
      title: '工序列表',
      autoQuery: false,
      enableHighlight: false,
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.SHOW,
    },
    {
      component: 'switch-editor',
      name: 'autoQuery',
      label: '自动查询',
      group: PropGroup.BUSINESS_CONFIG,
    },
    {
      component: 'switch-editor',
      name: 'enableHighlight',
      label: '点击高亮',
      group: PropGroup.BUSINESS_CONFIG,
    },
    ...displayEditor,
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'rowClickEvent',
      title: 'sys.pageDesigner.rowClickEvent',
      params: ['row'],
    },
    {
      name: 'loadedEvent',
      title: '加载完成',
      params: ['list'],
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
