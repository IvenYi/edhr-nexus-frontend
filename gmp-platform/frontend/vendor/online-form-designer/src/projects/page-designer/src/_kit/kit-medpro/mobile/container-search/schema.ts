import { Component, defineAsyncComponent } from 'vue';
import {
  BindCmpStyleEnum,
  EntityModelCategoryEnum,
  FormComponents,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Form, SelectSearchProps } from '/@page-designer/types/web';
import {
  displayProps,
  displayEditor,
} from '/@page-designer/schema/common-config/display-editor-config';
import { KitType } from '../../../enums';
import { beginDrag, createWidgetByType } from '../../../../schema/utils';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { useScope } from '/@page-designer/hooks/useScope';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { has } from 'lodash-es';

export interface IContainerSearchProps extends SelectSearchProps {
  model: string;
  txnType: string;
  scan: boolean;
  scanSite: string;
  getFocus: boolean;
  notGoodContainer: boolean; // 是否包含不良批次
  actionKey: string; // 事务模型查询执行方法
  modelData: { modelCategory: EntityModelCategoryEnum };
  defaultModelKey: string;
  maxLength: number;
  rowLength: number;
}

export interface IContainerSearch extends LowCodeWidget.BasicSchema {
  props: IContainerSearchProps;
  children: [Form];
}
// 批次模型
const containerModelKey = 'em_container';

export default class MedProContainerSearch implements IDesignerProvider {
  // kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./container-search-designer.vue'));

  schema: IContainerSearch = {
    id: '',
    platform: Platform.MOBILE,
    name: 'sys.kit.medPro.containerSearch',
    alias: '',
    type: 'medpro' + KitType.CONTAINER_SEARCH,
    displayName: 'sys.kit.medPro.containerSearch',
    icon: 'icon-sousuo',
    children: [] as any as [Form],
    props: {
      model: containerModelKey,
      txnType: '',
      scan: false,
      scanSite: 'right',
      getFocus: false,
      modelData: { modelCategory: EntityModelCategoryEnum.ENTITY },
      notGoodContainer: false,
      actionKey: 'biz_search',
      defaultModelKey: containerModelKey,
      quickSearchFields: 'name_',
      rowLength: 2,
      maxLength: 2,
      placeholder: '请搜索或扫描单据条码',
      ...displayProps,
    } as any,
    style: {
      enableBGColor: true,
    },
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    // 事务类型
    {
      component: 'select-editor',
      name: 'txnType',
      label: 'sys.kit.medPro.txnType',
      required: false,
      group: PropGroup.SEARCH,
      _config: {
        tips: 'sys.kit.medPro.txnTips',
        showSearch: true,
        multiple: false,
        options: async (widget) => {
          const modelList =
            (await getModelComprehensiveModelSummary({
              type: 'TRANSACTION',
              category: widget.props.modelData.modelCategory ?? EntityModelCategoryEnum.ENTITY,
            })) ?? [];
          return modelList.map((model) => {
            return {
              label: model.name,
              value: model.key,
            };
          });
        },
      },
    },
    // 是否包含不良批次
    {
      component: 'switch-editor',
      name: 'notGoodContainer',
      label: 'sys.kit.medPro.notGoodTips',
      required: false,
      group: PropGroup.SEARCH,
    },
    // 快速扫码
    {
      component: 'switch-editor',
      name: 'scan',
      label: '快速扫码',
      required: false,
      group: PropGroup.SEARCH,
    },
    {
      component: 'radio-editor',
      name: 'scanSite',
      label: '',
      group: PropGroup.SEARCH,
      changeCallback: () => {},
      _config: {
        options: [
          {
            label: '最右侧',
            value: 'right',
          },
          {
            label: '最左侧',
            value: 'left',
          },
        ],
      },
      dependentProps: ['scan'],
    },
    {
      component: 'input-attr-editor',
      name: 'getFocus',
      label: 'sys.pageDesigner.inputAttr',
      group: PropGroup.INPUT_CONFIG,
      _config: {
        needFieldAttrs: ['getFocus'],
        focusTips: 'sys.pageDesigner.getFocusTip2',
      },
      changeCallback(widget, value) {
        if (value.includes('getFocus')) {
          const { scopeData } = useScope();
          const fields = findNodeAll(scopeData.value, (res) => {
            return has(res.props, 'getFocus') && res.id !== widget.id;
          });
          fields.forEach((field) => {
            field.props.getFocus = false;
          });
        }
      },
    },
    {
      component: 'text-editor',
      name: 'placeholder',
      label: 'sys.pageDesigner.fieldPlaceholder',
      group: PropGroup.INPUT_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
      hidden(widget) {
        return (
          widget.props.bindFieldKey ||
          widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_TIME ||
          widget.props.readonly ||
          widget.props.fieldReadonly
        );
      },
    },
    // 展示字段
    {
      // 新建显示字段
      component: 'field-formula-editor',
      name: 'root:children.0.children',
      label: '',
      group: PropGroup.SHOW,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        createField: (item, widget: IContainerSearch) => {
          // const field = createWidgetByType(item.createType);
          // field.alias = item.label;
          // field.props.label = item.label;
          // field.i18n!.label = item.labeli18n;
          // field.props.remark = item.remark;
          // field.props.model = containerModelKey;
          // field.preLocation = widget.id;
          // field.props.fieldType =
          //   item.createType === FormComponents.DataTableFormula ? item.type : 'text';
          // field.props.field =
          //   item.createType === FormComponents.DataTableFormula ? field.id : item.key;
          // field.props.isCustomField = true;
          // if (item.createType === FormComponents.ReadonlyCmp) {
          //   field.name = 'sys.pageDesigner.custom';
          //   field.icon = 'icon-zidingyixianshiziduan';
          // } else {
          //   field.props.formula = item.formula;
          // }
          // return field;
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.isCustomField = true;
          fieldWidget.props.label = fieldWidget.alias;
          return fieldWidget;
        },
      },
    },
    {
      // 选择模型字段
      component: 'table-field-list-editor',
      name: 'root:children.0.children',
      label: '',
      group: PropGroup.SHOW,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        modelByKey: 'defaultModelKey',
        showcheckbox: false,
        createField: (item, widget: IContainerSearch) => {
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
      name: 'beforeSearch',
      title: 'sys.pageDesigner.beforeSearch',
      params: ['value', 'data'],
    },
    {
      name: 'afterSearch',
      title: 'sys.pageDesigner.afterSearch',
      params: ['data'],
    },
    {
      name: 'afterClear',
      title: 'sys.pageDesigner.afterClear',
      params: [],
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
      component: 'color-editor',
      name: 'backgroundColor',
      label: 'sys.pageDesigner.backgroundColor',
      group: StyleGroup.BACKGROUND,
    },
    {
      component: 'boolean-editor',
      name: 'enableBGColor',
      label: 'sys.pageDesigner.coloringThemeColor',
      group: StyleGroup.BACKGROUND,
      _config: {
        showType: 'checkbox',
        options: [
          {
            label: '',
            value: true,
          },
        ],
      },
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

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    widget.children = [null];
    const form = createWidgetByType(FormComponents.Form);
    form.alias = '批次表单';
    form.children = [];
    form.props.model = widget.props.model;
    // @ts-ignore
    form.props.useType = 'CONTAIN_SEARCH';
    widget.children[0] = form;
  };
}
