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
import { displayEditor } from '../../../../schema/common-config/display-editor-config';
import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';

export interface ISignatureConfirmProps extends LowCodeWidget.WidgetProps {
  title: string;
  purposeOfSignature?: string;
  isSignRequired?: boolean;
}

export interface ISignatureConfirm extends LowCodeWidget.BasicSchema {
  props: ISignatureConfirmProps;
}

export default class SignatureConfirmConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./signature-confirm-designer.vue'));

  // kit: string[] = ['MEDPRONEW'];

  schema: ISignatureConfirm = {
    id: '',
    platform: Platform.PAD,
    name: 'sys.kit.signatureConfirm',
    alias: '',
    type: 'medpro' + KitType.SIGNATURE_CONFIRM,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.signatureConfirm',
    icon: 'icon-a-yinyongshuju2',
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
      component: 'switch-editor',
      name: 'isSignRequired',
      label: '强制签名校验',
      group: PropGroup.BUTTON,
    },
    {
      component: 'select-editor',
      name: 'purposeOfSignature',
      label: 'sys.kit.purposeOfSignature',
      required: true,
      group: PropGroup.BUTTON,
      _config: {
        options: async () => {
          const res: any = await getEnumModelFieldPageList({
            enumModelId: 'enu_sign_type',
            enumModelKey: 'enu_sign_type',
          });
          return (res.data || []).map((model) => {
            return {
              label: model.text,
              value: model.value,
            };
          });
        },
      },
      hidden: () => {},
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'afterVerification',
      title: 'sys.kit.afterSignatureVerification',
      params: ['rowValue'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    // {
    //   component: 'number-editor',
    //   label: 'sys.pageDesigner.maximumHeight',
    //   group: StyleGroup.LAYOUT,
    //   name: 'maxHeight',
    //   _config: {
    //     min: 200,
    //   },
    // },
    // {
    //   component: 'margin-editor',
    //   group: StyleGroup.MARGIN,
    // },
  ];
}
