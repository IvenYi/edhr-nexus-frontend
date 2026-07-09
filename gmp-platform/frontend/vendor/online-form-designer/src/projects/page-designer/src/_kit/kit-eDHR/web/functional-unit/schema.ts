import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';
import FunctionalMoudles, { moudleNameMaps } from './comps';

console.log('CreateFormGroup', FunctionalMoudles);
export interface IFunctionalUnit extends LowCodeWidget.BasicSchema {
  children: [];
}

export default class FunctionalUnit implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./functional-unit-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: IFunctionalUnit = {
    id: '',
    platform: Platform.WEB,
    name: '功能组件',
    alias: '',
    type: KitType.FUNCTIONAL_UNIT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    props: {
      ...displayProps,
    },
    children: [] as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'select-editor',
      name: 'moudle',
      label: '功能模块(仅展示)',
      group: PropGroup.BASIC,
      _config: {
        options: async () => {
          return Object.entries(moudleNameMaps).map(([key, val]) => {
            return {
              label: val,
              value: key,
            };
          });
        },
      },
      changeCallback(widget) {
        widget.props.funcName = '';
      },
    },
    {
      component: 'select-editor',
      name: 'funcName',
      label: '业务方法(仅展示)',
      group: PropGroup.BASIC,
      _config: {
        options: async (widget) => {
          if (!widget.props.moudle) return [];
          return Object.keys(FunctionalMoudles[widget.props.moudle]).map((e) => {
            return {
              value: e,
              label: e,
            };
          });
        },
      },
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [];

  beforeCreate?: LowCodeWidget.beforeCreate = async () => {};

  // 页面设计器配置
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
