import {
  CreateType,
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
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '../../../../schema/common-config/common-field-editor-config';

export interface SelectSwitcherProps extends LowCodeWidget.WidgetProps {
  refFormModel: string | undefined;
  title: string;
  refModel: string;
  bindModelKey?: string;
  field: undefined | string;
  required?: boolean;
  readonly?: boolean;
  customdataSource?: boolean;
  datasourceConfig?: any;
  refForm: string;
}
export interface ISelectSwitcher extends LowCodeWidget.BasicSchema {
  props: SelectSwitcherProps;
}

export default class SelectSwitcher implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./select-switcher-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: ISelectSwitcher = {
    id: '',
    platform: Platform.WEB,
    name: '选择切换器',
    alias: '',
    type: KitType.SELECT_SWITCHER,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      title: '选择切换器',
      refModel: 'em_operation',
      field: '',
      customdataSource: false,
      datasourceConfig: null,
      refFormModel: '',
      refForm: '',
      ...displayProps,
    },
    children: [],
    style: {},
    events: {},
    formItem: false,
    i18n: {},
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),

    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
      },
    },

    {
      component: 'model-editor',
      name: 'refModel',
      label: 'sys.pageDesigner.model',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        category: 'entity,data,view',
      },
    },

    {
      component: 'field-editor',
      name: 'field',
      label: '字段选择',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的字段',
        modelKey: 'refFormModel',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    {
      component: 'switch-editor',
      name: 'customdataSource',
      label: 'sys.pageDesigner.customDataSource',
      group: PropGroup.DATASOURCE,
    },
    {
      component: 'data-sourse-editor',
      name: 'datasourceConfig',
      label: '',
      group: PropGroup.DATASOURCE,
      hidden(widget) {
        return !widget.props.customdataSource;
      },
    },

    ...displayEditor,
  ];

  beforeCreate?: Function | undefined = () => {};

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'item', 'formData'],
    },
    {
      name: 'onLoaded',
      title: 'sys.kit.medPro.optionLoaded',
      params: ['value', 'options', 'formData'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
    {
      component: 'font-editor',
      name: 'labelFont',
      label: 'sys.name',
      group: StyleGroup.STYLE,
    },
    {
      component: 'font-editor',
      name: 'contentFont',
      label: 'sys.content',
      group: StyleGroup.STYLE,
    },
  ];

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
