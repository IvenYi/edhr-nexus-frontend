import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  INumberEditor,
} from '@gct/runtime';
import {
  DesignEditorType,
  DesignItemActionTag,
  DesignNodeMode,
  DesignNodeType,
  MaterialGroup,
} from '../../constant';
import {
  IDesignItemAction,
  IMaterialData,
  INodeProvider,
  IStyleBorder,
  IStyleSpacing,
} from '../../interface';
import { DesignGridItemNode } from './design-grid-item.data';
import { NodeBaseProvider } from '../../provider';

/**
 * 栅格容器子项
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:10
 * @export
 * @class DesignGridItemProvider
 * @extends {NodeBaseProvider<DesignGridItemNode>}
 * @implements {INodeProvider<DesignGridItemNode>}
 */
export class DesignGridItemProvider
  extends NodeBaseProvider<DesignGridItemNode>
  implements INodeProvider<DesignGridItemNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.GRID_ITEM;

  override isDrag: boolean = false;

  component = 'DesignGridItemComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '栅格容器子项',
    type: DesignNodeType.GRID_ITEM,
    icon: 'icon-a-gudingbiaosvg',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    children: [
      {
        type: 'tab',
        name: 'tab',
        isContainer: true,
        layout: 'flex',
        navPosition: 'center',
        height: '100%',
        children: [
          {
            name: 'pane1',
            type: 'tab-pane',
            isContainer: true,
            title: window.$t('sys.designView.form.attribute'),
            layout: 'grid',
            children: [
              {
                name: 'collapse-property',
                type: 'collapse',
                isContainer: true,
                layout: 'flex',
                children: [
                  {
                    name: 'collapse-pane-config',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.components.gridCol.form.group'),
                    children: [
                      {
                        type: 'hidden',
                        name: 'i18nConfig',
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.gridCol.form.label'),
                        name: 'span',
                        labelWidth: '50px',
                        editor: {
                          type: EditorType.NUMBER,
                          min: 1,
                          max: 24,
                          props: {
                            size: 'small',
                          },
                        } as INumberEditor,
                      } as IFormEditItem,
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'pane2',
            type: 'tab-pane',
            class: 'style-pane',
            title: window.$t('sys.designView.form.style'),
            isContainer: true,
            layout: 'grid',
            children: [
              {
                name: 'collapse-style',
                type: 'collapse',
                isContainer: true,
                layout: 'flex',
                children: [
                  {
                    name: 'collapse-pane-bg',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.background'),
                    children: [
                      {
                        type: 'item',
                        label: window.$t('sys.designView.form.backgroundColor'),
                        name: 'background',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '56px',
                        editor: {
                          type: EditorType.COLOR,
                        },
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                  {
                    name: 'collapse-pane-spacing',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.margin'),
                    children: [
                      {
                        type: 'hidden',
                        name: 'padding',
                      },
                      {
                        type: 'item',
                        name: 'margin',
                        fields: ['margin', 'padding'],
                        editor: {
                          type: DesignEditorType.STYLE_SPACING,
                          showArea: ['padding'],
                        } as IStyleSpacing,
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                  {
                    name: 'collapse-pane-border',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.border'),
                    children: [
                      {
                        type: 'item',
                        name: 'border',
                        editor: {
                          type: DesignEditorType.STYLE_BORDER,
                          showArea: ['basics'],
                        } as IStyleBorder,
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                ],
              } as IFormCollapse,
            ],
          },
        ] as IFormTabPane[],
      } as IFormTab,
    ],
  };

  protected override createActions(): IDesignItemAction[] {
    return [
      {
        tag: DesignItemActionTag.SELECT_PARENT,
        icon: 'icon-fuzujian',
        tooltip: window.$t('sys.designView.tips.selectParent'),
      },
    ];
  }

  create(data?: DesignGridItemNode): DesignGridItemNode {
    return new DesignGridItemNode(data);
  }
}
