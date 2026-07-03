import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
// import { BaseButton } from '/@page-designer/types/web';
// import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
// import {
//   buttonEditor,
//   buttonStyleEditor,
// } from '/@page-designer/schema/common-config/button-editor-config';
// import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import { btnGroupType } from './type';

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

export class BtnGroupPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPROOLD'];

  component: Component = defineAsyncComponent(() => import('./button-group-designer.vue'));

  schema: IButtonGroup = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.serviceButton',
    alias: '',
    type: KitType.BUTTON_GROUP,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.serviceButton',
    icon: 'icon-fuzhibanben',
    props: {
      refForm: undefined,
      buttonGroup: [
        btnGroupType.CREATE,
        btnGroupType.COPY,
        btnGroupType.COPYVERSION,
        btnGroupType.DELETE,
        btnGroupType.MODELING,
        btnGroupType.USEINFO,
      ],
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
      component: 'button-group-editor',
      name: 'buttonGroup',
      label: 'sys.pageDesigner.buttonZone',
      group: PropGroup.BUTTON,
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
    {
      name: 'afterExecution',
      title: 'sys.afterExecution',
      params: ['type'],
    },
    // {
    //   name: 'beforeSubmit',
    //   title: 'sys.pageDesigner.beforeSubmit',
    //   params: ['formdata'],
    // },
    // {
    //   name: 'afterSubmit',
    //   title: 'sys.pageDesigner.afterSubmit',
    //   params: ['id'],
    // },
  ];

  // styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
}
