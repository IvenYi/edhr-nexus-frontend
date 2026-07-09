import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { modulesList } from './type';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';

export interface EDhrSEProps extends LowCodeWidget.WidgetProps {
  modulesList: string[];
  print: boolean;
}
export interface IEDhrSE extends LowCodeWidget.BasicSchema {
  props: EDhrSEProps;
}

export default class EDhrSE implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./edhr-se-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IEDhrSE = {
    id: '',
    platform: Platform.WEB,
    name: 'eDHR',
    alias: '',
    type: 'medpro' + KitType.EDHR_SE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      modulesList: [],
      print: true,
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
    {
      component: 'checkbox-list-editor',
      name: 'modulesList',
      label: '业务模块',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        options: modulesList,
      },
      hidden() {
        return true;
      },
      changeCallback: (widget, value) => {
        if (!value.includes('passingStation')) {
          widget.props.modulesList = value.includes('check') ? ['check'] : [];
        } else {
          widget.props.modulesList = value;
        }
      },
    },
    {
      component: 'switch-editor',
      name: 'print',
      label: '打印',
      group: PropGroup.BUSINESS_CONFIG,
    },
  ];

  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'afterSearch',
      title: 'sys.pageDesigner.afterSearch',
      params: ['data'],
    },
    {
      name: 'afterClear',
      title: 'sys.pageDesigner.afterClear',
      params: [],
    },
    {
      name: 'onPrint',
      title: 'sys.print',
      params: ['data'],
    },
  ];
}
