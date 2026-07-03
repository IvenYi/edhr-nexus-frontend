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

export interface BizSwitchProps extends LowCodeWidget.WidgetProps {
  label: string;
  showExplain: boolean;
  explain: string;
  key: string;
  layout: string;
}
export interface IBizSwitch extends LowCodeWidget.BasicSchema {
  props: BizSwitchProps;
}

export default class BizSwitch implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./biz-switch-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IBizSwitch = {
    id: '',
    platform: Platform.WEB,
    name: '业务开关',
    alias: '',
    type: 'medpro' + KitType.BIZ_SWITCH,
    display: DisplayEnums.BLOCK,
    icon: 'icon-kaiguan',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      ...displayProps,
      label: '${sys.pageDesigner.switch}',
      showExplain: false,
      explain: '',
      key: '',
      layout: 'horizontal'
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
      component: 'custom-name-editor',
      name: 'label',
      label: 'sys.pageDesigner.title',
      formItemStyle: { marginBottom: '12px' },
      group: PropGroup.GENSWITCH,
    },
    {
      component: 'text-editor',
      name: 'key',
      label: '业务开关Key',
      group: PropGroup.GENSWITCH,
      required: true,
    },
    {
      component: 'switch-editor',
      name: 'showExplain',
      label: 'sys.pageDesigner.explain',
      group: PropGroup.GENSWITCH,
    },
    {
      component: 'texteare-editor',
      name: 'explain',
      label: '',
      group: PropGroup.GENSWITCH,
      hidden: (widget) => {
        return !widget.props.showExplain;
      },
      _config: {
        i18n: true,
      },
    },
    {
      component: 'select-editor',
      name: 'layout',
      label: 'sys.pageDesigner.layout',
      group: PropGroup.GENSWITCH,
      _config: {
        options: [
          {
            label: 'sys.pageDesigner.horizontal',
            value: 'horizontal',
          },
          {
            label: 'sys.pageDesigner.vertical',
            value: 'vertical',
          },
        ],
      }
    }
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'row'],
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
