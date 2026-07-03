import { Component, defineAsyncComponent } from 'vue';
import { IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import { SelectSearchProps } from '/@page-designer/types/web';
import {
  displayProps,
  displayEditor,
} from '/@page-designer/schema/common-config/display-editor-config';
import { styleEditorList } from '/@page-designer/schema/web/other/select-search';
import { KitType } from '../../../enums';

const modelKey = 'em_package_bar_code';

export interface IPackageBarcodeProps extends SelectSearchProps {
  model: string;
  title: string;
  defaultModelKey: string;
  layout: string;
  hiddenBtn: boolean;
}

export interface IPackageBarcode extends LowCodeWidget.BasicSchema {
  props: IPackageBarcodeProps;
}

export default class MedProPackageSearch implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./package-barcode-designer.vue'));

  schema: IPackageBarcode = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.medPro.packageBarcode.title',
    alias: '',
    type: 'medpro' + KitType.PACKAGE_BARCODE,
    displayName: 'sys.kit.medPro.packageBarcode.title',
    icon: 'icon-tiaoma',
    props: {
      model: modelKey,
      defaultModelKey: modelKey,
      layout: 'horizontal',
      hiddenBtn: false,
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'select-editor',
      name: 'layout',
      label: '',
      group: PropGroup.FIELD_LAYOUT,
      _config: {
        options: () => [
          {
            label: '水平布局',
            value: 'horizontal',
          },
          {
            label: '垂直布局',
            value: 'vertical',
          },
        ],
      },
    },
    {
      component: 'switch-editor',
      name: 'hiddenBtn',
      label: '隐藏查询',
      required: false,
      group: PropGroup.SEARCH,
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['id', 'option'],
    },
    {
      name: 'afterSearch',
      title: 'sys.kit.medPro.packageBarcode.afterSearch',
      params: ['id', 'data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...styleEditorList];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {};
}
