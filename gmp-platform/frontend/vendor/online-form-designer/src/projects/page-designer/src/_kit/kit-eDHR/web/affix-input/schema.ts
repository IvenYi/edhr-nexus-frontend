import {
  CreateType,
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  TagTypeEnum,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { FIELD_TYPE } from '@/enums/appEnum';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';

export interface AffixInputProps extends LowCodeWidget.WidgetProps {
  label: string;
  readonly: boolean;
  required: boolean;
  disabled: boolean;
  /** 显示标题 */
  displayLabelText: boolean;
  openAffix: boolean;
  prefix?: string;
  suffix?: string;
  field: string;
  placeholder: string;
}
export interface IAffixInput extends LowCodeWidget.BasicSchema {
  props: AffixInputProps;
}

export default class AffixInput implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./affix-input-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: IAffixInput = {
    id: '',
    platform: Platform.WEB,
    name: '附加输入框',
    alias: '',
    type: KitType.AFFIX_INPUT,
    display: DisplayEnums.BLOCK,
    icon: '',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      label: '${sys.pageDesigner.title}',
      required: false,
      readonly: false,
      disabled: false,
      displayLabelText: true,
      openAffix: true,
      prefix: 'CUS_',
      suffix: undefined,
      field: '',
      placeholder: '${sys.appDesigner.inputPlaceholder}',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
    i18n: {},
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'root:name',
      label: 'sys.pageDesigner.widgetName',
      group: PropGroup.BASIC,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
    },
    {
      component: 'text-editor',
      name: 'label',
      label: 'sys.pageDesigner.title',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
      },
    },
    {
      component: 'field-editor',
      name: 'field',
      label: 'sys.pageDesigner.field',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的相关关联字段',
        modelKey: 'refFormModel',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    {
      component: 'checkbox-editor',
      name: 'displayLabelText',
      label: 'sys.pageDesigner.displayLabelText',
      group: PropGroup.FIELD_CONFIG,
    },
    {
      component: 'switch-editor',
      name: 'openAffix',
      label: '是否开启前缀后缀',
      group: PropGroup.FIELD_CONFIG,
      changeCallback: (widget, value) => {
        if (!value) {
          widget.props.prefix = undefined;
          widget.props.suffix = undefined;
        }
      },
    },
    {
      component: 'text-editor',
      name: 'prefix',
      label: 'Prefix',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
      hidden: (widget) => {
        return !widget.props.openAffix;
      },
    },
    {
      component: 'text-editor',
      name: 'suffix',
      label: 'Suffix',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
      hidden: (widget) => {
        return !widget.props.openAffix;
      },
    },

    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    ...commonFieldEditorConfig.placeholderEditor,
    ...commonFieldEditorConfig.validatorEditor,
    ...commonFieldEditorConfig.explainEditor,
    ...(displayEditor as any),
  ];
  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'formData'],
      hidden: (widget) => {
        return (
          widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB
        );
      },
    },
    {
      name: 'onEnter',
      title: 'sys.pageDesigner.onEnter',
      params: ['value', 'formData'],
      hidden: (widget) => {
        return (
          widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB
        );
      },
    },
    {
      name: 'onBlur',
      title: 'sys.pageDesigner.onBlur',
      params: ['value', 'formData'],
      hidden: (widget) => {
        return (
          widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB
        );
      },
    },
    {
      name: 'onFocus',
      title: 'sys.pageDesigner.onFocus',
      params: ['value', 'formData'],
      hidden: (widget) => {
        return (
          widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB
        );
      },
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
      component: 'number-editor',
      name: 'width',
      label: 'sys.width',
      group: StyleGroup.LAYOUT,
    },
    {
      component: 'number-editor',
      name: 'height',
      label: 'sys.height',
      group: StyleGroup.LAYOUT,
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
      hidden: (widget) => {
        return [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(widget.props.fieldType);
      },
    },
    {
      component: 'boolean-editor',
      name: 'tagStyleOpen',
      label: 'sys.pageDesigner.tagStyle',
      group: StyleGroup.STYLE,
      _config: {
        showType: 'checkbox',
        options: [
          {
            label: 'sys.pageDesigner.configureContentAsLabelStyle',
            value: true,
          },
        ],
      },
      changeCallback: (widget, value) => {
        if (value && !widget.style.tagStyle) {
          widget.style.tagStyle = {
            color: '',
            tagType: TagTypeEnum.RADIUS,
          };
        }
      },
    },
    {
      component: 'tag-editor',
      name: 'tagStyle',
      group: StyleGroup.STYLE,
      hidden: (widget) => {
        return !widget.style.tagStyleOpen;
      },
    },
  ];
}
