import { Component, defineAsyncComponent } from 'vue';
import {
  FormComponents,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { ColumnTable, Form, SelectSearchProps } from '/@page-designer/types/web';
import {
  displayProps,
  displayEditor,
} from '/@page-designer/schema/common-config/display-editor-config';
import { styleEditorList } from '/@page-designer/schema/web/other/select-search';
import { KitType } from '../../../enums';
import { beginDrag, createWidgetByType } from '../../../../schema/utils';

const modelKey = 'em_order_package_rule_entry';

export interface IPackageSearchProps extends SelectSearchProps {
  model: string;
  txnType: string;
  title: string;
  defaultModelKey: string;
  maxLength: number;
  rowLength: number;
}

export interface IPackageSearch extends LowCodeWidget.BasicSchema {
  props: IPackageSearchProps;
  children: [ColumnTable[], Form, any];
}

export default class MedProPackageSearch implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./package-search-designer.vue'));

  schema: IPackageSearch = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.medPro.packageSearch.title',
    alias: '',
    type: 'medpro' + KitType.PACKAGE_SEARCH,
    displayName: 'sys.kit.medPro.packageSearch.title',
    icon: 'icon-sousuo',
    props: {
      model: modelKey,
      defaultModelKey: modelKey,
      rowLength: 5,
      maxLength: 10,
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    // 展示字段
    {
      // 1. 新建显示字段
      component: 'field-formula-editor',
      name: 'root:children.1.children',
      label: '',
      group: PropGroup.SHOW,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        createField: (item, widget: IPackageSearch) => {
          const field = createWidgetByType(item.createType);
          field.alias = item.label;
          field.props.label = item.label;
          field.i18n!.label = item.labeli18n;
          field.props.remark = item.remark;
          field.preLocation = widget.id;
          field.props.fieldType =
            item.createType === FormComponents.DataTableFormula ? item.type : 'text';
          field.props.field =
            item.createType === FormComponents.DataTableFormula ? field.id : item.key;
          field.props.isCustomField = true;
          if (item.createType === FormComponents.ReadonlyCmp) {
            field.name = 'sys.pageDesigner.custom';
            field.icon = 'icon-zidingyixianshiziduan';
          } else {
            field.props.formula = item.formula;
          }
          return field;
        },
      },
    },
    {
      // 2. 选择模型字段
      component: 'table-field-list-editor',
      name: 'root:children.1.children',
      label: '',
      group: PropGroup.SHOW,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        modelByKey: 'defaultModelKey',
        showcheckbox: false,
        createField: (item, widget: IPackageSearch) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
        },
      },
    },
    // 单行显示个数
    {
      component: 'number-editor',
      name: 'rowLength',
      label: 'sys.pageDesigner.NumberOfSingleLineDisplays',
      group: PropGroup.SHOW,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 5,
      },
    },
    // 最多显示个数
    {
      component: 'number-editor',
      name: 'maxLength',
      label: 'sys.pageDesigner.MaximumNumberOfDisplays',
      group: PropGroup.SHOW,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 20,
      },
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeLock',
      title: 'sys.kit.medPro.packageSearch.beforeLock',
      params: ['data'],
    },
    {
      name: 'afterLock',
      title: 'sys.kit.medPro.packageSearch.afterLock',
      params: ['data'],
    },
    {
      name: 'afterUnlock',
      title: 'sys.kit.medPro.packageSearch.afterUnlock',
      params: ['data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...styleEditorList];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    widget.children = [[], null];
    const form = createWidgetByType(FormComponents.Form);
    form.alias = '批次表单';
    form.children = [];
    form.props.model = widget.props.model || widget.props.defaultModelKey;
    // @ts-ignore
    form.props.useType = 'CONTAIN_SEARCH';
    widget.children[1] = form;
  };
}
