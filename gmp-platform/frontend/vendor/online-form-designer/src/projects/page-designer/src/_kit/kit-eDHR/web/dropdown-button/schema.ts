import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { BaseButton, BaseButtonProps } from '/@page-designer/types/web';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import {
  buttonEditor,
  buttonStyleEditor,
} from '/@page-designer/schema/common-config/button-editor-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export interface IDropdownButtonProps extends BaseButtonProps {
  title: string;
  list?: string;
  hiddenMore?: boolean;
}

export interface IDropdownButton extends LowCodeWidget.BasicSchema {
  props: IDropdownButtonProps;
}

export default class DropdownButtonConfig implements IDesignerProvider {
  kit: string[] = ['eDHR'];

  component: Component = defineAsyncComponent(() => import('./dropdown-button-designer.vue'));

  schema: IDropdownButton = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.dropdownButton',
    alias: '',
    type: KitType.DROPDOWN_BUTTON,
    display: DisplayEnums.INLINE_BLOCK,
    displayName: 'sys.kit.dropdownButton',
    icon: 'icon-a-yinyongshuju2',
    props: {
      ...baseBtnProp,
      title: '下拉按钮',
    } as any,
    style: {},
    events: {},
    formItem: false,
    i18n: {},
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
      component: 'switch-editor',
      name: 'hiddenMore',
      label: '隐藏更多图标',
      group: PropGroup.BUTTON,
    },
    {
      component: 'texteare-editor',
      name: 'list',
      label: '下拉按钮',
      group: PropGroup.BUTTON,
      // _config: {
      //   i18n: true,
      //   maxlength: 10,
      //   showCount: true,
      //   list: [],
      // },
    },
    ...(displayEditor as any),
    ...(buttonEditor as any),
    ...(permissionEditor as any),
  ];
  /** 事件配置 */
  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onClick',
      title: 'sys.pageDesigner.onClick',
      params: [],
    },
    {
      name: 'menuClick',
      title: '_kit.pageDesigner.menuClick',
      params: ['item'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
}
