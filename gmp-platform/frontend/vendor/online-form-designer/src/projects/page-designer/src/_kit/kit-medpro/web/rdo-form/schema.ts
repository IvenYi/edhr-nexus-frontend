import {
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  EntityModelTypeEnum,
  StyleGroup,
  FormComponents,
} from '@gct/runtime';
import { KitType } from '../../../enums';
import { Component, defineAsyncComponent } from 'vue';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { deepFindNotField } from '../../../../schema/utils';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';

export interface ITxnDataCollection extends LowCodeWidget.BasicSchema {
  props: {
    model?: string;
    layout: string;
    validateRule: [];
    readonly: boolean;
    //rdo 标识字段 默认name_
    rdoUniqueFieldKey?: string;
  } & LowCodeWidget.DisplayProps;
}

export default class MedProRdoFormConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./rdo-form-designer.vue'));
  kit: string[] = ['MEDPRO', 'TRAINING', 'eDHR'];
  schema: ITxnDataCollection = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.pageDesigner.rdoform',
    alias: '',
    type: 'medpro' + KitType.RDO_FORM,
    icon: 'icon-RDObiaodan',
    children: [],
    dropPlaceholder: '选择关联模型',
    props: {
      model: undefined,
      layout: 'horizontal',
      validateRule: [],
      readonly: false,
      rdoUniqueFieldKey: '',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
    ignoringStyle: [],
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
      async changeCallback(widget, value) {
        const { specificConfig } = (await getModelMetaDetail({ modelKey: value })) || {};
        widget.props.rdoUniqueFieldKey = specificConfig?.rdoUniqueFieldKey || 'name_';
        if (widget.children && widget.children.length) {
          widget.children = deepFindNotField(widget.children);
        }
        widget.dropPlaceholder = widget.props.model ? '拖拽组件/字段到这里' : '选择关联模型';
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
