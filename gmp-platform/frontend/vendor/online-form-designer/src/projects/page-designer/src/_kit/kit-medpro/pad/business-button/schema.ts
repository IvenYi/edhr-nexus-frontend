import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import { StyleGroup } from '/@page-designer/enum';
import { ButtonProps } from '/@page-designer/types/web';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export interface IBusinessButtonProps extends ButtonProps {
  title: string;
}

export interface IBusinessButton extends LowCodeWidget.BasicSchema {
  props: IBusinessButtonProps;
}

export default class MedProBusinessPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./business-button-designer.vue'));

  schema: IBusinessButton = {
    id: '',
    platform: Platform.PAD,
    name: 'sys.kit.serviceButton',
    alias: '',
    type: 'medpro' + KitType.BUSINESS_BUTTON,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.serviceButton',
    icon: 'icon-yewu',
    props: {
      ...baseBtnProp,
      icon: 'icon-platform:platform-pad-picigezhi',
      size: 40,
      title: '${sys.kit.serviceButton}',
      layout: 'vertical',
      hiddenLayoutTip: true,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'icon-editor',
      name: { icon: 'icon', iconColor: 'iconColor' },
      label: 'sys.pageDesigner.buttonIcon',
      group: PropGroup.ButtonStyle,
      _config: {
        clearable: false,
      },
    },
    {
      component: 'number-editor',
      name: 'size',
      label: 'sys.pageDesigner.size',
      formItemClass: 'in-row-editor',
      group: PropGroup.ButtonStyle,
      _config: {
        min: 0,
        max: 1000,
        addonAfter: 'px',
      },
    },
    {
      component: 'form-layout-editor',
      name: 'layout',
      label: '布局方式',
      group: PropGroup.ButtonStyle,
    },
    ...(displayEditor as any),
    ...(permissionEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onClick',
      title: 'sys.pageDesigner.onClick',
      params: [],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'position-editor',
      name: 'position',
      label: 'sys.pageDesigner.position',
      group: StyleGroup.LAYOUT,
    },
    {
      component: 'font-editor',
      name: 'contentFont',
      label: 'sys.pageDesigner.character',
      group: StyleGroup.STYLE,
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
    {
      component: 'border-radius-editor',
      group: StyleGroup.BORDER,
    },
    {
      component: 'border-editor',
      group: StyleGroup.BORDER,
    },
  ];
}
