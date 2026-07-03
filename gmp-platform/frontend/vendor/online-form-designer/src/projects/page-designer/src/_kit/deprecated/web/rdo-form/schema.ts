import {
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  EntityModelTypeEnum,
  StyleGroup,
  FormComponents,
} from '@gct/runtime';
import { KitType } from '../../enums';
import { Component, defineAsyncComponent } from 'vue';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { deepFindNotField } from '../../../../schema/utils';

export interface ITxnDataCollection extends LowCodeWidget.BasicSchema {
  props: {
    model?: string;
    layout: string;
    validateRule: [];
    readonly: boolean;
  } & LowCodeWidget.DisplayProps;
}

export class RdoFormConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./rdo-form-designer.vue'));
  kit: string[] = ['MEDPROOLD'];
  schema: ITxnDataCollection = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.pageDesigner.rdoform',
    alias: '',
    type: KitType.RDO_FORM,
    icon: 'icon-RDObiaodan',
    children: [],
    props: {
      model: undefined,
      layout: 'horizontal',
      validateRule: [],
      readonly: false,
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
    ignoringStyle: ['height'],
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'model-editor',
      name: 'model',
      label: 'sys.pageDesigner.model',
      group: PropGroup.FORM_CONFIG,
      required: true,
      _config: {
        type: [EntityModelTypeEnum.RDO, EntityModelTypeEnum.WORKFLOW].join(','),
        clearChildren: false,
      },
      changeCallback(widget) {
        if (widget.children && widget.children.length) {
          widget.children = deepFindNotField(widget.children);
        }
      },
    },
    {
      component: 'form-layout-editor',
      name: 'layout',
      label: '',
      group: PropGroup.FIELD_LAYOUT,
      dependentProps: ['model'],
    },
    {
      component: 'switch-editor',
      name: 'readonly',
      label: 'sys.pageDesigner.filedWholeReadonly',
      group: PropGroup.FORM_CONFIG,
      hidden(widget: Form) {
        return !widget.props.model;
      },
      _config: {},
    },
    {
      component: 'validate-editor',
      name: 'validateRule',
      label: '',
      group: PropGroup.VALIDATERULE,
      _config: {
        modelKey: 'model',
      },
      dependentProps: ['model'],
    },
    ...displayEditor,
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
  events: LowCodeWidget.EventsType[] = [];

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };

  blackList: (string | RegExp)[] = [
    FormComponents.Form,
    FormComponents.RdoForm,
    FormComponents.FormProcess,
    FormComponents.MedProRdoForm,
  ];
}
