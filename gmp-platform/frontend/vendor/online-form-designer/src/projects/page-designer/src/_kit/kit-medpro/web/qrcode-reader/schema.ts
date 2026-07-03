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
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { buttonEditor } from '/@page-designer/schema/common-config/button-editor-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';

export interface QrcodeReaderProps extends LowCodeWidget.WidgetProps {
  /** 摄像头模式: environment=后置, user=前置, false=文件选择 */
  captureMode?: 'environment' | 'user' | 'false';
}
export interface IQrcodeReader extends LowCodeWidget.BasicSchema {
  props: QrcodeReaderProps;
}

export default class QrcodeReader implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./qrcode-reader-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IQrcodeReader = {
    id: '',
    platform: Platform.WEB,
    name: '二维码扫描',
    alias: '',
    type: 'medpro' + KitType.QRCODE_READER,
    display: DisplayEnums.BLOCK,
    icon: 'icon-erweima',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      ...baseBtnProp,
      captureMode: 'environment',
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
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'select-editor',
      name: 'captureMode',
      label: '摄像头模式',
      group: PropGroup.BUTTON,
      _config: {
        clearable: false,
        options: [
          { label: '后置摄像头（默认）', value: 'environment' },
          { label: '前置摄像头', value: 'user' },
          { label: '选择图片文件', value: 'false' },
        ],
      },
    },
    ...(displayEditor as any),
    ...(buttonEditor as any),
    ...(permissionEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onDetect',
      title: 'sys.pageDesigner.onDetect',
      params: ['value'],
    },
  ];
}
