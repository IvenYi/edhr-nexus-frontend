import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  FormComponents,
} from '@gct/runtime';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';

export interface CategoryTreeProps extends LowCodeWidget.WidgetProps {
  /** 关联表单 */
  model?: string;
}

export interface ICategoryTree extends LowCodeWidget.BasicSchema {
  props: CategoryTreeProps;
  children: [any, any, any];
}

export default class CategoryTree implements IDesignerProvider {
  kit: string[] = ['eDHR'];

  component: Component = defineAsyncComponent(() => import('./category-tree-designer.vue'));

  schema: ICategoryTree = {
    id: '',
    platform: Platform.WEB,
    name: '分类树',
    alias: '',
    type: KitType.CATEGORY_TREE,
    display: DisplayEnums.BLOCK,
    displayName: '分类树',
    icon: 'icon-RDOliebiao',
    children: [{}, {}, {}],
    dropPlaceholder: '选择关联模型',
    props: {
      model: undefined,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'model-editor',
      name: 'model',
      label: 'sys.pageDesigner.model',
      group: PropGroup.Button,
      required: true,
      _config: {
        type: 'NDO,BASE,TREE,TRANSACTION,CHECK_LIST',
        clearChildren: false,
        category: 'entity,data,view',
      },
    },
    {
      component: 'gct-table-button-group-editor',
      label: '',
      dependentProps: ['model'],
      name: {
        headerRight: {
          value: 'root:children.1.children',
          visibleButtons: 'root:children.1.visibleButtons',
        },
        headerLeft: {
          value: 'root:children.2.children',
          visibleButtons: 'root:children.2.visibleButtons',
        },
        columns: {
          value: 'root:children.0.children',
          visibleButtons: 'root:children.0.props.visibleButtons',
        },
      },
      group: PropGroup.Button,
      _config: {
        /**添加按钮的回调 */
        eventCallback(widget: any) {
          widget.parentComponent = FormComponents.DataTable;
        },
        modelKey: 'model',
        headerRightButton: () => {
          return [
            FormComponents.CustomButton,
            FormComponents.ImportButton,
            FormComponents.ExportButton,
          ];
        },
        headerLeftButton: (widget) => {
          if (widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW) {
            return [FormComponents.CustomButton];
          }
          return [FormComponents.CustomButton, FormComponents.BatchDeleteButton];
        },
        columnsButton: (widget) => {
          const { modelCategory } = widget.props.modeldata || {};
          if (modelCategory === EntityModelCategoryEnum.VIEW) {
            return [
              FormComponents.CustomButton,
              FormComponents.SubTableCopyBtn,
              FormComponents.TableInfoButton,
            ];
          }
          if (modelCategory === EntityModelCategoryEnum.DATA) {
            return [
              FormComponents.CustomButton,
              FormComponents.SubTableEditBtn,
              FormComponents.SubTableDeleteBtn,
              FormComponents.SubTableCopyBtn,
              FormComponents.TableInfoButton,
            ];
          }
          return [
            FormComponents.CustomButton,
            FormComponents.SubTableEditBtn,
            FormComponents.SubTableDeleteBtn,
            FormComponents.SubTableCopyBtn,
            FormComponents.TableInfoButton,
            FormComponents.ModelingButton,
          ];
        },
      },
    },

    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onNodeSelect',
      title: 'sys.pageDesigner.onNodeSelect',
      params: ['data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
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
  ];
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
  beforeCreate: LowCodeWidget.beforeCreate = (widget) => {
    const ope = createWidgetByType(FormComponents.DataTableOpe);
    ope.preLocation = widget.id;
    // ope.id = undefined;
    widget.children = [
      ope,
      {
        alias: '头部按钮',
        preLocation: widget.id,
        visibleButtons: 1,
        children: [],
      },
      {
        alias: '批量按钮',
        preLocation: widget.id,
        visibleButtons: 1,
        children: [],
      },
    ];
  };
}
