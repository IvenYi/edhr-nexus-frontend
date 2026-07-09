import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { schemaType } from './type';

export interface ButtonGroupProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  refForm?: string;
  buttonGroup: any[];
  bindModelKey?: string;
}

export interface IButtonGroup extends LowCodeWidget.BasicSchema {
  props: ButtonGroupProps;
}

export default class BtnGroupPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./button-group-designer.vue'));

  schema: IButtonGroup = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.serviceButton',
    alias: '',
    type: 'medpro' + KitType.BUTTON_GROUP,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.serviceButton',
    icon: 'icon-yewu',
    children: [],
    props: {
      refForm: undefined,
      bindModelKey: '',
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.BUTTON,
      required: true,
      onMounted(widget: IButtonGroup) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = undefined;
        }
      },
    },
    {
      component: 'medpro-button-container-editor',
      name: '',
      label: 'sys.pageDesigner.buttonZone',
      group: PropGroup.BUTTON,
      onMounted(widget: IButtonGroup) {
        if (!widget.props?.refForm) return;
        if (!widget.children?.length) {
          for (const key in schemaType) {
            const data = createWidgetByType(schemaType[key]);
            widget?.children?.push(data);
          }
        }
      },
      hidden(widget) {
        return !widget.props.refForm;
      },
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onClick',
      title: 'sys.pageDesigner.onClick',
      params: ['type'],
    },
  ];
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
