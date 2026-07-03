import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  FormComponents,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';

export interface TreeProps extends LowCodeWidget.WidgetProps {
  displayLabelText?: boolean;
  label?: string;
  model: string;
  showIcon?: boolean;
  showLine?: boolean;
  /**初始化加载 */
  initializeLoad: boolean;
  /**默认展开层级 */
  defaultExpandLevel: number;
  icon?: string;
  modelData: { modelCategory: EntityModelCategoryEnum };
  refSearch?: string;
}

interface ITree extends LowCodeWidget.BasicSchema {
  props: TreeProps;
}

const { t } = useI18n();

export default class MedProTree implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./tree-designer.vue'));
  kit: string[] = ['MEDPRO'];
  schema: ITree = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.tree',
    alias: '',
    type: 'medpro' + KitType.TREE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-shuxingbiaoge',
    props: {
      model: '',
      showIcon: false,
      showLine: false,
      icon: '',
      initializeLoad: true,
      defaultExpandLevel: 2,
      modelData: { modelCategory: EntityModelCategoryEnum.ENTITY },
      refSearch: '',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'model-editor',
      name: 'model',
      label: 'sys.pageDesigner.model',
      group: PropGroup.TREE_CONFIG,
      required: true,
      changeCallback(widget) {
        widget.props.refSearch = '';
        widget.children![1].children.splice(0);
      },
      _config: {
        type: 'TREE',
        category: 'entity',
      },
    },

    {
      component: 'select-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.TREE_CONFIG,
      dependentProps: ['model'],
      _config: {
        options: () => {
          const { getWidgetByScope } = useDesigner();
          return getWidgetByScope(FormComponents.Search).map((i) => {
            return { label: `${t(i.name)} ${i.id}`, value: i.id };
          });
        },
      },
    },

    {
      component: 'default-expand-editor',
      name: 'defaultExpandLevel',
      label: 'sys.pageDesigner.defaultExpandLevel',
      dependentProps: ['model'],
      group: PropGroup.SHOW,
    },
    {
      component: 'switch-editor',
      name: 'initializeLoad',
      label: 'sys.pageDesigner.initializeLoad',
      dependentProps: ['model'],
      group: PropGroup.SHOW,
    },

    ...displayEditor,
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'afterSelect',
      title: 'sys.pageDesigner.afterSelect',
      params: ['value', 'treeData'],
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
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];
}
