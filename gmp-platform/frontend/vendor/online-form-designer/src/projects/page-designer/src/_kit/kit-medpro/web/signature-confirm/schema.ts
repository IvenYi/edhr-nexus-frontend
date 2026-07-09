import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export interface ISignatureConfirmProps extends LowCodeWidget.WidgetProps {
  title: string;
  isSignRequired: boolean;
  justConfirm: boolean;
}

export interface ISignatureConfirm extends LowCodeWidget.BasicSchema {
  props: ISignatureConfirmProps;
}

export default class SignatureConfirmConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./signature-confirm-designer.vue'));

  schema: ISignatureConfirm = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.signatureConfirm',
    alias: '',
    type: 'medpro' + KitType.SIGNATURECONFIRM,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.signatureConfirm',
    icon: 'icon-dianziqianmingdd',
    props: {
      title: '签名确认',
      isSignRequired: false,
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
      component: 'switch-editor',
      name: 'isSignRequired',
      label: '强制签名校验',
      group: PropGroup.BUTTON,
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'validate',
      title: 'sys.kit.signatureConfirm',
      params: ['rowValue'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      label: 'sys.pageDesigner.maximumHeight',
      group: StyleGroup.LAYOUT,
      name: 'maxHeight',
      _config: {
        min: 200,
      },
    },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];
}
