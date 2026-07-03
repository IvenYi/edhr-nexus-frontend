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
import {
  buttonEditor,
  buttonStyleEditor,
} from '/@page-designer/schema/common-config/button-editor-config';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';

export interface ExcelUploadProps extends LowCodeWidget.WidgetProps {
  title: string;
  startRowIndex: number;
  headerRowIndex: number;
  saveAttachment: boolean;
}
export interface IExcelUpload extends LowCodeWidget.BasicSchema {
  props: ExcelUploadProps;
}

export default class ExcelUpload implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./excel-upload-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IExcelUpload = {
    id: '',
    platform: Platform.WEB,
    name: 'Excel解析',
    alias: '',
    type: 'medpro' + KitType.EXCEL_UPLOAD,
    display: DisplayEnums.BLOCK,
    icon: 'icon-file',
    materialType: MaterialEnum.MaterialFormField,
    props: {
      ...displayProps,
      ...baseBtnProp,
      title: '${sys.pageDesigner.fileUpload}',
      startRowIndex: 1,
      headerRowIndex: 0,
      saveAttachment: true,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    ...buttonEditor,
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      formItemStyle: { marginBottom: '12px' },
      group: PropGroup.BUTTON,
    },
    {
      component: 'number-editor',
      name: 'startRowIndex',
      label: 'sys.pageDesigner.startRowIndex',
      group: PropGroup.BUTTON,
      _config: {
        min: 0,
      },
    },
    {
      component: 'number-editor',
      name: 'headerRowIndex',
      label: 'sys.pageDesigner.headerRowIndex',
      group: PropGroup.BUTTON,
      _config: {
        min: 0,
      },
    },
    {
      component: 'switch-editor',
      name: 'saveAttachment',
      label: 'sys.pageDesigner.saveAttachment',
      group: PropGroup.BUTTON,
    },
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeUpload',
      title: 'sys.pageDesigner.beforeUpload',
      params: ['file'],
    },
    {
      name: 'afterUpload',
      title: 'sys.pageDesigner.afterUpload',
      params: ['data', 'file'],
    },
  ];
  styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
}
